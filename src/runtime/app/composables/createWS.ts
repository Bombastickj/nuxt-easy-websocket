import type { EasyWSClientState } from '../../shared-types'
import { computed, readonly, ref } from '#imports'
import { onNuxtReady } from '#app'
import { clientRoutes } from '#nuxt-easy-websocket/client'

/**
 * WebSocket connection states as defined in the WebSocket API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
 */
const WS_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
} as const

export function createWS(
  socketName: string,
  url: string | (() => string) | null,
  config: {
    autoConnect: boolean
    reconnectOnClose: boolean
    maxReconnectAttempts: number
    reconnectDelay: number
    heartbeat: {
      active: boolean
      timeoutMs: number
    }
  },
) {
  // State management
  const state = ref<EasyWSClientState>({
    reconnectCountdown: null,
    lastError: null,
    connectionAttempts: 0,
    readyState: config.autoConnect ? WS_STATES.CONNECTING : WS_STATES.CLOSED,
  })

  // Computed properties for derived state
  const maxReconnectAttemptsReached = computed(() =>
    state.value.connectionAttempts >= config.maxReconnectAttempts,
  )
  const connectionStatus = computed(() => {
    switch (state.value.readyState) {
      case WS_STATES.CONNECTING:
        return 'connecting'
      case WS_STATES.OPEN:
        return 'connected'
      case WS_STATES.CLOSING:
        return 'closing'
      case WS_STATES.CLOSED:
        return 'disconnected'
      default:
        return 'unknown'
    }
  })

  // Private variables for socket management
  let wsURL: string | (() => string) | null = url
  let socket: WebSocket | null = null
  let socketOpenPromise: Promise<void> | null = null
  let socketOpenResolve: (() => void) | null = null
  let socketOpenReject: ((reason?: unknown) => void) | null = null
  let countdownInterval: number | null = null
  let manuallyClosed = false

  /**
   * Initializes the promise resolver for handling socket connection
   * This is used when 'send' is called before the socket is ready
   */
  function initResolver() {
    if (socketOpenResolve) return

    // create new socketOpenPromise
    socketOpenPromise = new Promise<void>((resolve, reject) => {
      socketOpenResolve = resolve
      socketOpenReject = reject
    })
  }

  function cleanupSocket() {
    manuallyClosed = false

    if (!socket) return
    socket.removeEventListener('open', handleOpen)
    socket.removeEventListener('close', handleClose)
    socket.removeEventListener('error', handleError)
    socket.removeEventListener('message', handleMessage)
    socket = null
  }

  /**
   * Updates the WebSocket ready state and triggers relevant state updates
   */
  function updateReadyState(newState: number) {
    state.value.readyState = newState
  }

  /**
   * Attempts to reconnect to the WebSocket server with a countdown
   * Will not attempt if maximum reconnection attempts have been reached
   */
  function attemptReconnect() {
    if (maxReconnectAttemptsReached.value) {
      console.error('[ClientSocket]: Max reconnection attempts reached. Giving up.')
      state.value.reconnectCountdown = null
      return
    }

    state.value.reconnectCountdown = config.reconnectDelay / 1000
    const interval = 1000
    let remaining = config.reconnectDelay / 1000

    if (countdownInterval !== null) clearInterval(countdownInterval)
    countdownInterval = window.setInterval(() => {
      remaining -= 1
      if (remaining <= 0) {
        if (countdownInterval !== null) clearInterval(countdownInterval)
        state.value.reconnectCountdown = null
        state.value.connectionAttempts++
        initWebSocket()
      }
      else {
        state.value.reconnectCountdown = remaining
      }
    }, interval)
  }

  function initWebSocket() {
    // check if socket is already connected
    if (socket?.readyState === WS_STATES.OPEN) return

    // cleanup any previous created socket
    cleanupSocket()

    // Prepare a new promise so that send() will wait until 'open'
    initResolver()

    // Check if wsURL is set
    if (typeof wsURL !== 'function' && !wsURL) {
      throw new Error(`[ClientSocket]: Missing websocket url. Checkout your 'nuxt.config.ts' or use 'setURL()' before connecting.`)
    }

    // console.log(`[ClientSocket]: Attempting to connect to ${resolvedURL}`)
    const resolvedURL = typeof wsURL === 'string' ? wsURL : wsURL()
    socket = new WebSocket(resolvedURL)
    updateReadyState(socket.readyState)

    socket.addEventListener('open', handleOpen)
    socket.addEventListener('close', handleClose)
    socket.addEventListener('error', handleError)
    socket.addEventListener('message', handleMessage)
  }

  /**
   * Handles the WebSocket 'open' event
   */
  function handleOpen() {
    // console.log('[ClientSocket]: Connection opened')
    updateReadyState(WS_STATES.OPEN)

    // Reset connection state
    state.value.reconnectCountdown = null
    state.value.connectionAttempts = 0
    state.value.lastError = null

    // Resolve any pending send operations
    socketOpenResolve?.()
    socketOpenResolve = socketOpenReject = null
  }

  /**
   * Handles WebSocket 'close' event
   */
  function handleClose(event: CloseEvent) {
    const closeMessage = `Connection closed (Code: ${event.code}, Reason: ${event.reason || 'No reason provided'})`
    state.value.lastError = closeMessage
    updateReadyState(WS_STATES.CLOSED)

    socketOpenReject?.(new Error(closeMessage))
    socketOpenResolve = socketOpenReject = null
    initResolver()

    // only reconnect if user didn't manually close
    if (config.reconnectOnClose && !manuallyClosed) attemptReconnect()
  }

  /**
   * Handles WebSocket 'error' event
   */
  function handleError(error: Event | ErrorEvent) {
    const errorMessage = error instanceof ErrorEvent ? error.message : 'WebSocket connection error'
    state.value.lastError = errorMessage

    socketOpenReject?.(new Error(errorMessage))
    socket?.close()
  }

  /**
   * Handles incoming WebSocket messages
   */
  async function handleMessage(message: MessageEvent) {
    try {
      // _heartbeat functionality
      if (config.heartbeat.active) {
        if (message.data === '_heartbeat') {
          socket?.send('_heartbeat')
          return
        }
      }

      // console.log('[ClientSocket]: Message received:', message.data)
      const { name, data }: { name: string, data: unknown } = JSON.parse(message.data)
      const eventModule = clientRoutes[socketName].find(e => e.name === name)

      if (eventModule) {
        // Execute the handler associated with the event
        await eventModule.handler({ data })
      }
      else {
        const error = `Event not found: ${name}`
        console.warn('[ClientSocket]:', error)
        state.value.lastError = error
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error processing message'
      console.error('[ClientSocket]: Error processing message:', errorMessage)
      state.value.lastError = errorMessage
    }
  }

  /**
   * Sends a typed message through the WebSocket
   * Will wait for connection if socket is currently connecting
   */
  async function send(name: string, data?: unknown) {
    // console.info('[ClientSocket]: Send:', name, ', Data:', data)
    if (import.meta.server) return

    if (state.value.readyState === WS_STATES.OPEN) {
      socket?.send(JSON.stringify({ name, data }))
      return
    }

    if (!socketOpenPromise) {
      console.error('[ClientSocket]: socketOpenPromise is not set.')
      return
    }

    // we wait until a socket connection has been made
    await socketOpenPromise

    socket?.send(JSON.stringify({ name, data }))
  }

  /**
   * Closes the socket.
   * @param keepClosed if `true` prevents any automatic reconnects
   */
  function disconnect(keepClosed = false) {
    if (countdownInterval !== null) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }

    // mark that we shouldn't auto-reconnect
    manuallyClosed = keepClosed

    // close socket (triggers handleClose)
    socket?.close()
  }

  /**
   * Forces a reconnection attempt regardless of current state
   */
  function forceReconnect() {
    if (countdownInterval !== null) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
    state.value.reconnectCountdown = null
    state.value.connectionAttempts++
    initWebSocket()
  }

  /**
   * Set the WebSocket URL dynamically.
   *
   * @param newUrl - The new WebSocket URL to use when connecting.
   */
  function setURL(newUrl: string) {
    wsURL = newUrl
  }

  // Initialize the plugin
  if (import.meta.client) initResolver()
  onNuxtReady(config.autoConnect ? initWebSocket : () => { })

  // Expose public API
  return {
    send,
    state: readonly(state),
    connectionStatus,
    maxReconnectAttemptsReached,
    connect: initWebSocket,
    disconnect,
    forceReconnect,
    setURL,
  }
}
