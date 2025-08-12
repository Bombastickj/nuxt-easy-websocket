import defu from 'defu'
import { createWS } from '../composables/createWS'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import type { NuxtEasyWebSocketPublicRuntimeConfig } from '../../../types'

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
  const configured = config.public.easyWebSocket.externalSockets as NuxtEasyWebSocketPublicRuntimeConfig['externalSockets']
  if (configured) {
    for (const [name, socketConfig] of Object.entries(configured)) {
      const mergedConfig = defu(
        socketConfig.ws,
        defaultWSConfig,
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
