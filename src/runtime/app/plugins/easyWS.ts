import defu from 'defu'
import { createWS } from '../composables/createWS'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export default defineNuxtPlugin((_nuxtApp) => {
  const config = useRuntimeConfig()

  // Create the default WebSocket connection
  const defaultWSConfig = config.public.easyWebSocket.ws

  const defaultWS = createWS('default', () => {
    const isSecure = location.protocol === 'https:'
    return `${isSecure ? 'wss://' : 'ws://'}${location.host}/_ws`
  }, defaultWSConfig)

  // Create external WebSocket connections if configured
  const externalSockets: { [key: string]: ReturnType<typeof createWS> } = {}
  if (config.public.easyWebSocket.externalSockets) {
    for (const [name, socketConfig] of Object.entries(config.public.easyWebSocket.externalSockets)) {
      const mergedConfig = defu(
        defaultWSConfig,
        socketConfig.ws,
      )

      externalSockets[name] = createWS(
        name,
        socketConfig.url,
        mergedConfig,
      )
    }
  }

  return {
    provide: {
      easyWS: {
        ...defaultWS,
        external: externalSockets,
      },
    },
  }
})
