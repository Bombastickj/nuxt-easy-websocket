import { defineNuxtPlugin } from '#app'
import { clientRoutes } from '#nuxt-easy-websocket/client'
import type { EasyWSServerRoutes } from '#nuxt-easy-websocket/routes'

export default defineNuxtPlugin((_nuxtApp) => {
  // this plugin only works on client
  if (import.meta.server) return {}

  const isSecure = location.protocol === 'https:'
  const url = (isSecure ? 'wss://' : 'ws://') + location.host + '/_ws'
  const socket = new WebSocket(url)

  // Promise to track the open state of the socket
  let socketOpenResolve: () => void
  const socketOpenPromise = new Promise<void>((resolve) => {
    socketOpenResolve = resolve
  })

  socket.addEventListener('open', () => {
    console.log('[ClientSocket]:', 'open')
    socketOpenResolve()
  })

  socket.addEventListener('message', async (message) => {
    try {
      const { name, data }: { name: string, data: unknown } = JSON.parse(message.data)
      console.log('[ClientSocket]:', message.data)

      const eventModule = clientRoutes.find(e => e.name === name)
      if (eventModule) {
        // Execute the handler associated with the event
        await eventModule.handler({ data })
      }
      else {
        console.log('Event not found')
      }
    }
    catch (error) {
      console.error('[ClientSocket]:', error)
    }
  })
  socket.addEventListener('close', () => {
    console.log('[ClientSocket]:', 'close')
  })

  async function send<T extends keyof EasyWSServerRoutes>(name: T, data?: EasyWSServerRoutes[T]) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({ name, data }),
      )
    }
    else if (socket.readyState === WebSocket.CONNECTING) {
      await socketOpenPromise
      socket.send(
        JSON.stringify({ name, data }),
      )
    }
    else {
      console.error('[ClientSocket]: Cannot send message, socket is not open.')
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
