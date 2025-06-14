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
  let countdownInterval: number | null = null

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

  /**
   * Updates the WebSocket ready state and triggers relevant state updates
   */
  function updateReadyState(newState: number) {
    state.value.readyState = newState
  }

  /**
   * Initializes the promise resolver for handling socket connection
   * This is used when 'send' is called before the socket is ready
   */
  function initResolver() {
    if (socketOpenResolve) return

    // create new socketOpenPromise
    socketOpenPromise = new Promise<void>((resolve) => {
      socketOpenResolve = resolve
    })
  }

  function initWebSocket() {
    // check if socket is already connected
    if (socket?.readyState === WS_STATES.OPEN) return

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
   * Set the WebSocket URL dynamically.
   *
   * @param newUrl - The new WebSocket URL to use when connecting.
   */
  function setURL(newUrl: string) {
    wsURL = newUrl
  }

  /**
   * Closes the socket.
   * @param keepClosed if `true` prevents any automatic reconnects
   */
  function disconnect(keepClosed = false) {
    if (keepClosed) state.value.connectionAttempts = config.maxReconnectAttempts
    socket?.close()
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
    socketOpenResolve = null
  }

  /**
   * Handles WebSocket 'close' event
   */
  function handleClose(event: CloseEvent) {
    const closeMessage = `Connection closed (Code: ${event.code}, Reason: ${event.reason || 'No reason provided'})`
    // console.warn(`[ClientSocket]: ${closeMessage}`)
    state.value.lastError = closeMessage
    updateReadyState(WS_STATES.CLOSED)

    if (config.reconnectOnClose) attemptReconnect()
  }

  /**
   * Handles WebSocket 'error' event
   */
  function handleError(error: Event | ErrorEvent) {
    const errorMessage = error instanceof ErrorEvent ? error.message : 'WebSocket connection error'
    console.error('[ClientSocket]: WebSocket error:', errorMessage)
    state.value.lastError = errorMessage

    if (socket && socket.readyState !== WS_STATES.CLOSED) {
      socket.close()
    }
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
   * Forces a reconnection attempt regardless of current state
   */
  function forceReconnect() {
    if (countdownInterval !== null) clearInterval(countdownInterval)
    state.value.reconnectCountdown = null
    state.value.connectionAttempts++
    initWebSocket()
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
    }
    else {
      if (!socketOpenPromise) {
        console.error('[ClientSocket]: socketOpenPromise is not set.')
        return
      }

      // we wait until a socket connection has been made
      await socketOpenPromise

      socket?.send(JSON.stringify({ name, data }))
    }
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
