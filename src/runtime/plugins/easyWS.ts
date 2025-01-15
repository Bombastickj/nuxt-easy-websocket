import { defineNuxtPlugin } from '#app'
import { clientRoutes } from '#nuxt-easy-websocket/client'
import type { EasyWSServerRoutes } from '#nuxt-easy-websocket/routes'

export default defineNuxtPlugin((_nuxtApp) => {
  // This plugin only works on the client
  if (import.meta.server) return {}

  const isSecure = location.protocol === 'https:'
  const baseUrl = `${isSecure ? 'wss://' : 'ws://'}${location.host}/_ws`

  let socket: WebSocket | null = null
  let socketOpenResolve: (() => void) | null = null
  let socketOpenPromise: Promise<void> | null = null

  // Reconnection settings
  let reconnectAttempts = 0
  const maxReconnectAttempts = 10
  const baseReconnectDelay = 1000 // in ms

  // Function to establish WebSocket connection
  function connect() {
    socket = new WebSocket(baseUrl)
    // console.log(`[ClientSocket]: Attempting to connect to ${baseUrl}`)

    // Reset socketOpenPromise
    socketOpenPromise = new Promise<void>((resolve) => {
      socketOpenResolve = resolve
    })

    // Event listener for when the connection opens
    socket.addEventListener('open', () => {
      console.log('[ClientSocket]: Connection opened')
      reconnectAttempts = 0 // Reset reconnection attempts on successful connection
      if (socketOpenResolve) {
        socketOpenResolve()
        socketOpenResolve = null
      }
    })

    // Event listener for incoming messages
    socket.addEventListener('message', async (message) => {
      try {
        const { name, data }: { name: string, data: unknown } = JSON.parse(message.data)
        // console.log('[ClientSocket]: Message received:', message.data)
        const eventModule = clientRoutes.find(e => e.name === name)
        if (eventModule) {
          // Execute the handler associated with the event
          await eventModule.handler({ data })
        }
        else {
          console.warn('[ClientSocket]: Event not found:', name)
        }
      }
      catch (error) {
        console.error('[ClientSocket]: Error processing message:', error)
      }
    })

    // Event listener for connection closure
    socket.addEventListener('close', (event) => {
      console.warn(`[ClientSocket]: Connection closed (Code: ${event.code}, Reason: ${event.reason})`)
      attemptReconnect()
    })

    // Event listener for errors
    socket.addEventListener('error', (error) => {
      console.error('[ClientSocket]: WebSocket error:', error)
      // Optionally close the socket to trigger the 'close' event
      if (socket && socket.readyState !== WebSocket.CLOSED) {
        socket.close()
      }
    })
  }

  // Function to handle reconnection attempts
  function attemptReconnect() {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.error('[ClientSocket]: Max reconnection attempts reached. Giving up.')
      return
    }

    const delay = Math.min(baseReconnectDelay * 2 ** reconnectAttempts, 30000) // Exponential backoff up to 30 seconds
    // console.log(`[ClientSocket]: Reconnecting in ${delay / 1000} seconds... (Attempt ${reconnectAttempts + 1})`)

    setTimeout(() => {
      reconnectAttempts += 1
      connect()
    }, delay)
  }

  // Initialize the WebSocket connection
  connect()

  // Cleanup on unmount (optional, depending on your application's lifecycle)
  // You can add hooks here if necessary

  // Function to send messages through the WebSocket
  async function send<T extends keyof EasyWSServerRoutes>(name: T, data?: EasyWSServerRoutes[T]) {
    if (!socket) {
      console.error('[ClientSocket]: Socket is not initialized.')
      return
    }

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ name, data }))
    }
    else if (socket.readyState === WebSocket.CONNECTING) {
      if (!socketOpenPromise) {
        console.error('[ClientSocket]: socketOpenPromise is not set.')
        return
      }

      await socketOpenPromise
      socket.send(JSON.stringify({ name, data }))
    }
    else {
      console.error('[ClientSocket]: Cannot send message, socket is not open.')
      // Optionally, you can attempt to reconnect here
      attemptReconnect()
    }
  }

  return {
    provide: {
      easyWS: {
        send,
      },
    },
  }
})
