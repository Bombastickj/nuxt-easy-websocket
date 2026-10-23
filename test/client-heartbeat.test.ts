import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createWS } from '../src/runtime/app/composables/createWS'
import easyWSPlugin from '../src/runtime/app/plugins/easyWS'

const nuxt = vi.hoisted(() => ({
  ready: [] as Array<() => void>,
  runtimeConfig: {} as Record<string, unknown>,
  onText: vi.fn(),
}))

vi.mock('#imports', async () => {
  const { computed, readonly, ref } = await import('vue')
  return { computed, readonly, ref }
})
vi.mock('#app', () => ({
  onNuxtReady: (callback: () => void) => nuxt.ready.push(callback),
  defineNuxtPlugin: (plugin: unknown) => plugin,
  useRuntimeConfig: () => nuxt.runtimeConfig,
}))
vi.mock('#nuxt-easy-websocket/client', () => ({
  clientRoutes: { default: [{ name: '_text', handler: nuxt.onText }] },
}))

// close() intentionally never emits close: model a network that cannot finish
// the closing handshake, rather than a clean server-initiated disconnection.
class FakeWebSocket extends EventTarget {
  static instances: FakeWebSocket[] = []
  readyState = 0
  binaryType = 'blob'
  send = vi.fn()
  close = vi.fn(() => { this.readyState = 2 })

  constructor(readonly url: string) {
    super()
    FakeWebSocket.instances.push(this)
  }

  open() {
    this.readyState = 1
    this.dispatchEvent(new Event('open'))
  }

  message(data: unknown) {
    this.dispatchEvent(new MessageEvent('message', { data }))
  }

  serverClose(code = 1006, reason = '') {
    this.readyState = 3
    this.dispatchEvent(Object.assign(new Event('close'), { code, reason }))
  }
}

type Config = Parameters<typeof createWS>[2]

function config(overrides: Partial<Omit<Config, 'heartbeat'>> & { heartbeat?: Partial<Config['heartbeat']> } = {}): Config {
  return {
    autoConnect: true,
    reconnectOnClose: true,
    maxReconnectAttempts: 2,
    reconnectDelay: 1000,
    ...overrides,
    heartbeat: { active: true, timeoutMs: 1000, ...overrides.heartbeat },
  }
}

function ready() {
  nuxt.ready.splice(0).forEach(callback => callback())
}

function connect(options = config()) {
  const ws = createWS('default', 'ws://example.test', options)
  ready()
  const socket = FakeWebSocket.instances.at(-1)!
  socket.open()
  return { ws, socket }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('WebSocket', FakeWebSocket)
  vi.stubGlobal('window', globalThis)
  vi.stubGlobal('location', { protocol: 'http:', host: 'example.test' })
  FakeWebSocket.instances = []
  nuxt.ready = []
  nuxt.onText.mockReset()
})

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('client heartbeat recovery', () => {
  it.each([false, true])('recovers without a native close event (previous heartbeat: %s)', async (hadHeartbeat) => {
    const { ws, socket } = connect()
    if (hadHeartbeat) {
      vi.advanceTimersByTime(1000)
      socket.message('_heartbeat')
    }
    vi.advanceTimersByTime(1999)
    expect(ws.connectionStatus.value).toBe('connected')
    vi.advanceTimersByTime(1)
    expect(ws.connectionStatus.value).toBe('disconnected')
    expect(ws.state.value.lastError).toContain('Heartbeat timeout')
    expect(socket.close).toHaveBeenCalledWith(4000, 'Heartbeat timeout')
    expect(ws.state.value.reconnectCountdown).toBe(1)
    expect(FakeWebSocket.instances).toHaveLength(1)

    // Sends made during the outage wait for the replacement connection.
    const send = ws.sendRaw('after recovery')
    vi.advanceTimersByTime(1000)
    expect(FakeWebSocket.instances).toHaveLength(2)
    expect(ws.connectionStatus.value).toBe('connecting')
    const replacement = FakeWebSocket.instances[1]!
    replacement.open()
    await send
    expect(replacement.send).toHaveBeenCalledWith('after recovery')
    expect(ws.connectionStatus.value).toBe('connected')
    expect(ws.state.value.lastError).toBeNull()

    socket.serverClose()
    socket.open()
    socket.message('_heartbeat')
    socket.dispatchEvent(new Event('error'))
    expect(ws.connectionStatus.value).toBe('connected')
    expect(ws.state.value.reconnectCountdown).toBeNull()
    expect(vi.getTimerCount()).toBe(1)
  })

  it('echoes late heartbeats and resets the full client deadline', () => {
    const { ws, socket } = connect(config({ heartbeat: { clientTimeoutMs: 3500 } }))
    vi.advanceTimersByTime(3000)
    expect(ws.connectionStatus.value).toBe('connected')
    socket.message('_heartbeat')
    expect(socket.send).toHaveBeenCalledExactlyOnceWith('_heartbeat')
    vi.advanceTimersByTime(3499)
    expect(ws.connectionStatus.value).toBe('connected')
    vi.advanceTimersByTime(1)
    expect(ws.connectionStatus.value).toBe('disconnected')
  })

  it('does not count application messages as heartbeats', () => {
    const { ws, socket } = connect()
    vi.advanceTimersByTime(1500)
    socket.message('application data')
    expect(nuxt.onText).toHaveBeenCalledWith({ data: 'application data' })
    vi.advanceTimersByTime(500)
    expect(ws.connectionStatus.value).toBe('disconnected')
  })

  it('does not monitor disabled heartbeats', () => {
    const { ws, socket } = connect(config({ heartbeat: { active: false } }))
    vi.advanceTimersByTime(120000)
    expect(ws.connectionStatus.value).toBe('connected')
    expect(socket.close).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('marks a timeout disconnected without reconnecting when disabled', () => {
    const { ws } = connect(config({ reconnectOnClose: false }))
    vi.advanceTimersByTime(120000)
    expect(ws.connectionStatus.value).toBe('disconnected')
    expect(FakeWebSocket.instances).toHaveLength(1)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('stops after the configured number of unsuccessful reconnect attempts', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { ws } = connect()
    vi.advanceTimersByTime(3000)
    FakeWebSocket.instances[1]!.serverClose()
    vi.advanceTimersByTime(1000)
    FakeWebSocket.instances[2]!.serverClose()
    vi.advanceTimersByTime(120000)
    expect(FakeWebSocket.instances).toHaveLength(3)
    expect(ws.maxReconnectAttemptsReached.value).toBe(true)
    expect(ws.state.value.reconnectCountdown).toBeNull()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('finalizes native closure once and cancels the heartbeat timer', () => {
    const { ws, socket } = connect()
    socket.serverClose(1000, 'Server closed')
    expect(ws.connectionStatus.value).toBe('disconnected')
    socket.serverClose()
    vi.advanceTimersByTime(1000)
    expect(FakeWebSocket.instances).toHaveLength(2)
    vi.advanceTimersByTime(10000)
    expect(FakeWebSocket.instances).toHaveLength(2)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('ignores callbacks already queued for a replaced socket', () => {
    const listeners = vi.spyOn(FakeWebSocket.prototype, 'addEventListener')
    const timeouts = vi.spyOn(globalThis, 'setTimeout')
    const { ws, socket } = connect()
    const oldListeners = listeners.mock.calls.slice()
    const oldTimeout = timeouts.mock.calls[0]![0] as () => void
    ws.forceReconnect()
    const replacement = FakeWebSocket.instances[1]!
    replacement.open()

    for (const [name, listener] of oldListeners) {
      const event = name === 'message'
        ? new MessageEvent('message', { data: '_heartbeat' })
        : Object.assign(new Event(name), { code: 1006, reason: 'Late close' })
      const callback = listener as EventListener
      callback.call(socket, event)
    }
    oldTimeout()
    expect(ws.connectionStatus.value).toBe('connected')
    expect(ws.state.value.lastError).toBeNull()
    expect(replacement.send).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(1)
    vi.advanceTimersByTime(2000)
    expect(ws.connectionStatus.value).toBe('disconnected')
  })

  it('does not report a late handler rejection on the replacement connection', async () => {
    let rejectHandler!: (error: Error) => void
    nuxt.onText.mockReturnValueOnce(new Promise((_resolve, reject) => { rejectHandler = reject }))
    const { ws, socket } = connect()
    socket.message('slow handler')
    ws.forceReconnect()
    FakeWebSocket.instances[1]!.open()
    rejectHandler(new Error('Old connection handler failed'))
    await vi.advanceTimersByTimeAsync(0)
    expect(ws.state.value.lastError).toBeNull()
    expect(ws.connectionStatus.value).toBe('connected')
  })
})

describe('manual connection lifecycle', () => {
  it('can stay disconnected before Nuxt is ready', () => {
    const ws = createWS('default', 'ws://example.test', config())
    ws.disconnect(true)
    expect(ws.connectionStatus.value).toBe('disconnected')
    ready()
    expect(FakeWebSocket.instances).toHaveLength(0)
    expect(vi.getTimerCount()).toBe(0)
  })

  it.each([true, false])('disconnect(%s) finalizes immediately without a close event', (keepClosed) => {
    const { ws, socket } = connect()
    ws.disconnect(keepClosed)
    expect(ws.connectionStatus.value).toBe('disconnected')
    expect(socket.close).toHaveBeenCalledOnce()
    vi.advanceTimersByTime(10000)
    expect(FakeWebSocket.instances).toHaveLength(keepClosed ? 1 : 2)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('disconnect(false) respects disabled automatic reconnect', () => {
    const { ws } = connect(config({ reconnectOnClose: false }))
    ws.disconnect()
    vi.advanceTimersByTime(10000)
    expect(ws.connectionStatus.value).toBe('disconnected')
    expect(FakeWebSocket.instances).toHaveLength(1)
  })

  it('disconnect(true) cancels a pending reconnect and connect() re-enables monitoring', () => {
    const { ws } = connect()
    vi.advanceTimersByTime(2000)
    ws.disconnect(true)
    expect(ws.state.value.reconnectCountdown).toBeNull()
    vi.advanceTimersByTime(10000)
    expect(FakeWebSocket.instances).toHaveLength(1)
    ws.connect()
    FakeWebSocket.instances[1]!.open()
    vi.advanceTimersByTime(2000)
    expect(ws.connectionStatus.value).toBe('disconnected')
    expect(ws.state.value.reconnectCountdown).toBe(1)
  })

  it.each([true, false])('forceReconnect replaces a socket (already open: %s)', async (open) => {
    const ws = createWS('default', 'ws://example.test', config())
    ready()
    const oldSocket = FakeWebSocket.instances[0]!
    if (open) oldSocket.open()
    const pendingSend = open ? undefined : ws.sendRaw('queued while connecting')
    vi.advanceTimersByTime(500)
    ws.forceReconnect()
    expect(oldSocket.close).toHaveBeenCalledOnce()
    expect(FakeWebSocket.instances).toHaveLength(2)
    expect(ws.connectionStatus.value).toBe('connecting')
    const replacement = FakeWebSocket.instances[1]!
    replacement.open()
    await pendingSend
    if (!open) expect(replacement.send).toHaveBeenCalledWith('queued while connecting')
    oldSocket.serverClose()
    vi.advanceTimersByTime(1500)
    expect(ws.connectionStatus.value).toBe('connected')
    expect(FakeWebSocket.instances).toHaveLength(2)
  })

  it('forceReconnect cancels a scheduled retry', () => {
    const { ws } = connect()
    vi.advanceTimersByTime(2000)
    ws.forceReconnect()
    FakeWebSocket.instances[1]!.open()
    vi.advanceTimersByTime(1000)
    expect(FakeWebSocket.instances).toHaveLength(2)
    expect(ws.state.value.reconnectCountdown).toBeNull()
  })

  it('connect() during a countdown cancels the retry and is idempotent while connecting', () => {
    const { ws } = connect()
    vi.advanceTimersByTime(2000)
    ws.connect()
    ws.connect()
    vi.advanceTimersByTime(1000)
    expect(FakeWebSocket.instances).toHaveLength(2)
    expect(ws.connectionStatus.value).toBe('connecting')
    expect(ws.state.value.reconnectCountdown).toBeNull()
  })

  it('queues sends before an explicitly opened connection', async () => {
    const ws = createWS('default', 'ws://example.test', config({ autoConnect: false }))
    ready()
    const send = ws.sendRaw('queued before connect')
    ws.connect()
    FakeWebSocket.instances[0]!.open()
    await send
    expect(FakeWebSocket.instances[0]!.send).toHaveBeenCalledWith('queued before connect')
  })

  it('rejects a waiting send when its connection closes before opening', async () => {
    const ws = createWS('default', 'ws://example.test', config())
    ready()
    const send = ws.sendRaw('cannot send')
    const rejection = expect(send).rejects.toThrow('Connection closed')
    ws.disconnect(true)
    await rejection
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('heartbeat configuration', () => {
  it.each([0, -1, Number.NaN, Infinity, -Infinity])('rejects invalid active interval %s', (timeoutMs) => {
    expect(() => createWS('invalid-socket', null, config({ heartbeat: { timeoutMs } })))
      .toThrow(/invalid-socket.*heartbeat.timeoutMs/)
    expect(FakeWebSocket.instances).toHaveLength(0)
    expect(vi.getTimerCount()).toBe(0)
  })

  it.each([0, -1, 999, 1000, Number.NaN, Infinity, -Infinity])('rejects invalid explicit deadline %s', (clientTimeoutMs) => {
    expect(() => createWS('invalid-socket', null, config({ heartbeat: { clientTimeoutMs } })))
      .toThrow(/invalid-socket.*heartbeat.clientTimeoutMs/)
    expect(FakeWebSocket.instances).toHaveLength(0)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('rejects an invalid explicit deadline even when monitoring is disabled', () => {
    expect(() => createWS('default', null, config({ heartbeat: { active: false, clientTimeoutMs: 1000 } })))
      .toThrow('heartbeat.clientTimeoutMs')
  })
})

describe('external socket configuration', () => {
  function external(externalHeartbeat?: Partial<Config['heartbeat']>, defaultHeartbeat?: Partial<Config['heartbeat']>) {
    nuxt.runtimeConfig = {
      public: {
        easyWebSocket: {
          ws: config({ autoConnect: false, heartbeat: defaultHeartbeat }),
          externalSockets: {
            thirdParty: {
              url: 'ws://third-party.test',
              ws: { autoConnect: true, heartbeat: externalHeartbeat },
            },
          },
        },
      },
    }
    // defineNuxtPlugin is an identity mock; invoke the real plugin to exercise
    // its configuration precedence, rather than duplicating the merge in tests.
    const plugin = easyWSPlugin as unknown as () => { provide: { easyWS: { external: Record<string, ReturnType<typeof createWS>> } } }
    const ws = plugin().provide.easyWS.external.thirdParty!
    ready()
    FakeWebSocket.instances[0]!.open()
    return ws
  }

  it('disables monitoring by default despite the internal socket default', () => {
    const ws = external()
    vi.advanceTimersByTime(120000)
    expect(ws.connectionStatus.value).toBe('connected')
    expect(FakeWebSocket.instances).toHaveLength(1)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('allows opt-in and derives the deadline from the overridden interval', () => {
    const ws = external({ active: true, timeoutMs: 2000 })
    vi.advanceTimersByTime(3999)
    expect(ws.connectionStatus.value).toBe('connected')
    vi.advanceTimersByTime(1)
    expect(ws.connectionStatus.value).toBe('disconnected')
  })

  it('inherits an explicit default deadline', () => {
    const ws = external({ active: true }, { clientTimeoutMs: 5000 })
    vi.advanceTimersByTime(4999)
    expect(ws.connectionStatus.value).toBe('connected')
    vi.advanceTimersByTime(1)
    expect(ws.connectionStatus.value).toBe('disconnected')
  })

  it('allows an external deadline to override the default', () => {
    const ws = external({ active: true, clientTimeoutMs: 3000 }, { clientTimeoutMs: 5000 })
    vi.advanceTimersByTime(3000)
    expect(ws.connectionStatus.value).toBe('disconnected')
  })

  it('rejects an inherited deadline that conflicts with the external interval', () => {
    expect(() => external({ active: true, timeoutMs: 6000 }, { clientTimeoutMs: 5000 }))
      .toThrow(/thirdParty.*heartbeat.clientTimeoutMs/)
    expect(FakeWebSocket.instances).toHaveLength(0)
    expect(vi.getTimerCount()).toBe(0)
  })
})
