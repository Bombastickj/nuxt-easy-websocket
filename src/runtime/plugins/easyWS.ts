import type { EasyWSClientState } from '../shared-types'
import { computed, onMounted, readonly, ref } from '#imports'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { clientRoutes } from '#nuxt-easy-websocket/client'
import type { EasyWSServerRoutes } from '#nuxt-easy-websocket/routes'

const WS_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
} as const

export default defineNuxtPlugin((_nuxtApp) => {
  let socket: WebSocket | null = null
  let socketOpenResolve: (() => void) | null = null
  let socketOpenPromise: Promise<void> | null = null

  const state = ref<EasyWSClientState>({
    isConnected: false,
    isReconnecting: false,
    reconnectCountdown: null,
    lastError: null,
    connectionAttempts: 0,
    readyState: WS_STATES.CLOSED,
  })

  const runtimeConfig = useRuntimeConfig().public.easyWebSocket.ws

  let currentReconnectTimeout: number | null = null
  let countdownInterval: number | null = null

  const maxReconnectAttemptsReached = computed(() =>
    state.value.connectionAttempts >= runtimeConfig.maxReconnectAttempts,
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

  function updateReadyState(newState: number) {
    state.value.readyState = newState
    state.value.isConnected = newState === WS_STATES.OPEN
  }

  // Function to establish WebSocket connection
  function connect() {
    const isSecure = location.protocol === 'https:'
    const baseUrl = `${isSecure ? 'wss://' : 'ws://'}${location.host}/_ws`

    if (socket?.readyState === WS_STATES.OPEN) return

    // console.log(`[ClientSocket]: Attempting to connect to ${baseUrl}`)
    socket = new WebSocket(baseUrl)
    updateReadyState(socket.readyState)

    // Reset socketOpenPromise
    socketOpenPromise = new Promise<void>((resolve) => {
      socketOpenResolve = resolve
    })

    // Event listener for when the connection opens
    socket.addEventListener('open', () => {
      console.log('[ClientSocket]: Connection opened')
      updateReadyState(WS_STATES.OPEN)
      state.value.isReconnecting = false
      state.value.reconnectCountdown = null
      state.value.connectionAttempts = 0
      state.value.lastError = null

      if (socketOpenResolve) {
        socketOpenResolve()
        socketOpenResolve = null
      }
    })

    // Event listener for incoming messages
    socket.addEventListener('message', async (message) => {
      try {
        // console.log('[ClientSocket]: Message received:', message.data)
        const { name, data }: { name: string, data: unknown } = JSON.parse(message.data)
        const eventModule = clientRoutes.find(e => e.name === name)

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
    })

    // Event listener for connection closure
    socket.addEventListener('close', (event) => {
      const closeMessage = `Connection closed (Code: ${event.code}, Reason: ${event.reason || 'No reason provided'})`
      console.warn(`[ClientSocket]: ${closeMessage}`)
      state.value.lastError = closeMessage
      updateReadyState(WS_STATES.CLOSED)

      if (runtimeConfig.reconnectOnClose) attemptReconnect()
    })

    // Event listener for errors
    socket.addEventListener('error', (error) => {
      const errorMessage = error instanceof Error ? error.message : 'WebSocket connection error'
      console.error('[ClientSocket]: WebSocket error:', errorMessage)
      state.value.lastError = errorMessage

      if (socket && socket.readyState !== WS_STATES.CLOSED) {
        socket.close()
      }
    })
  }

  // Function to handle reconnection attempts
  function attemptReconnect() {
    if (maxReconnectAttemptsReached.value) {
      console.error('[ClientSocket]: Max reconnection attempts reached. Giving up.')
      state.value.reconnectCountdown = null
      return
    }

    state.value.isReconnecting = true
    const delay = runtimeConfig.reconnectDelay

    state.value.reconnectCountdown = delay / 1000

    const interval = 1000
    let remaining = delay / 1000

    countdownInterval = window.setInterval(() => {
      remaining -= 1
      if (remaining <= 0) {
        if (countdownInterval !== null) clearInterval(countdownInterval)
        state.value.reconnectCountdown = null
      }
      else {
        state.value.reconnectCountdown = remaining
      }
    }, interval)

    currentReconnectTimeout = window.setTimeout(() => {
      state.value.connectionAttempts += 1
      connect()
      if (countdownInterval !== null) clearInterval(countdownInterval)
      state.value.reconnectCountdown = null
    }, delay)
  }

  // Function to manually trigger reconnect
  function forceReconnect() {
    if (countdownInterval !== null) clearInterval(countdownInterval)
    if (currentReconnectTimeout) {
      clearTimeout(currentReconnectTimeout)
      state.value.connectionAttempts += 1
    }
    state.value.reconnectCountdown = null
    connect()
  }

  // Initialize the WebSocket connection
  // This plugin only works on the client
  onMounted(connect)

  // Function to send messages through the WebSocket
  async function send<T extends keyof EasyWSServerRoutes>(name: T, data?: EasyWSServerRoutes[T]) {
    if (!socket) {
      console.error('[ClientSocket]: Socket is not initialized.')
      return
    }

    if (socket.readyState === WS_STATES.OPEN) {
      socket.send(JSON.stringify({ name, data }))
    }
    else if (socket.readyState === WS_STATES.CONNECTING) {
      if (!socketOpenPromise) {
        console.error('[ClientSocket]: socketOpenPromise is not set.')
        return
      }

      await socketOpenPromise
      socket.send(JSON.stringify({ name, data }))
    }
    else {
      console.error('[ClientSocket]: Cannot send message, socket is not open.')
    }
  }

  return {
    provide: {
      easyWS: {
        send,
        state: readonly(state),
        connectionStatus,
        maxReconnectAttemptsReached,

        // Utility methods
        disconnect: () => socket?.close(),
        forceReconnect,
      },
    },
  }
})
