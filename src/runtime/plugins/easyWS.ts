import { defineNuxtPlugin } from '#app'
import { clientEvents } from '#easy-websocket-client'
import type { EasyWSClientToServerEvents } from '#easy-websocket-server'

export default defineNuxtPlugin((_nuxtApp) => {
  // this plugin only works on client
  if (import.meta.server) return {}

  const isSecure = location.protocol === 'https:'
  const url = (isSecure ? 'wss://' : 'ws://') + location.host + '/_ws'
  const socket = new WebSocket(url)

  socket.addEventListener('message', async (message) => {
    try {
      const { name, data }: { name: string, data: unknown } = JSON.parse(message.data)
      console.log('[ClientSocket]:', message.data)

      const eventModule = clientEvents.find(e => e.name === name)
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
  socket.addEventListener('open', () => {
    console.log('[ClientSocket]:', 'open')
  })

  function send<T extends keyof EasyWSClientToServerEvents>(name: T, data?: EasyWSClientToServerEvents[T]) {
    socket.send(
      JSON.stringify({ name, data }),
    )
  }

  return {
    provide: {
      easyWS: {
        send,
      },
    },
  }
})
