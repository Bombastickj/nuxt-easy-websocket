import { defineNuxtModule } from '@nuxt/kit'
import { NUXT_EASY_WEBSOCKET_MODULE_ID } from './constants'
import { createContext } from './context'
import { prepareRuntime } from './prepare/runtime'
import { prepareLayers } from './prepare/layers'
import { setupHMR } from './dev/hotreload'

import { generateRouteTypes } from './gen/route-types'
import { generatePluginTypes } from './gen/plugin-types'
import { generateClientEvents } from './gen/client-events'
import { generateServerEvents } from './gen/server-events'

import type { NuxtEasyWebSocketModuleOptions } from './types'

export * from './types'

export default defineNuxtModule<NuxtEasyWebSocketModuleOptions>({
  meta: {
    name: NUXT_EASY_WEBSOCKET_MODULE_ID,
    configKey: 'easyWebSocket',
    compatibility: {
      nuxt: '>=4.0.0',
    },
  },
  // Default configuration options of the Nuxt module
  defaults: {
    serverSrcDir: 'socket',
    clientSrcDir: 'socket',
    delimiter: '/',
    ws: {
      autoConnect: true,
      maxReconnectAttempts: 10,
      reconnectDelay: 5000,
      reconnectOnClose: true,
      heartbeat: {
        active: true,
        timeoutMs: 30_000,
      },
    },
  },
  async setup(_options, _nuxt) {
    const ctx = createContext(_options)
    prepareRuntime(ctx, _nuxt)
    await prepareLayers(ctx, _nuxt)

    generateRouteTypes(ctx, _nuxt)
    generatePluginTypes(ctx)
    generateClientEvents(ctx, _nuxt)
    generateServerEvents(ctx, _nuxt)

    // Development mode file watching
    setupHMR(ctx, _nuxt)
  },
})
