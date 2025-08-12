import pathe from 'pathe'
import { defineNuxtModule, updateTemplates } from '@nuxt/kit'
import { NUXT_EASY_WEBSOCKET_MODULE_ID } from './constants'
import { createContext } from './context'
import { prepareRuntime } from './prepare/runtime'
import { prepareLayers } from './prepare/layers'

import { generateClientEvents, generatePluginTypes, generateRouteTypes, generateServerEvents } from './gen'

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
    if (_nuxt.options.dev) {
      let debounceTimeout: NodeJS.Timeout | null = null
      _nuxt.hook('builder:watch', async (_, path) => {
        path = pathe.relative(_nuxt.options.rootDir, pathe.resolve(_nuxt.options.rootDir, path))
        if (ctx.watchingPaths.filter(p => path.startsWith(p)).length === 0) return

        if (debounceTimeout) clearTimeout(debounceTimeout)
        debounceTimeout = setTimeout(async () => {
          // Clear cached routes and file scan cache
          ctx.clientRoutes = { default: [] }
          ctx.serverRoutes = []
          ctx.serverConnection = []
          ctx.watchingPaths = []

          await prepareLayers(ctx, _nuxt)
          generateRouteTypes(ctx, _nuxt)
          generatePluginTypes(ctx)
          generateClientEvents(ctx, _nuxt)
          generateServerEvents(ctx, _nuxt)

          updateTemplates({
            filter: (t) => {
              return [
                'types/nuxt-easy-websocket-plugin.d.ts',
                'types/nuxt-easy-websocket-routes.d.ts',
                'modules/nuxt-easy-websocket-client.mts',
                'modules/nuxt-easy-websocket-server.mts',
              ].includes(t.filename)
            },
          })
        }, 300)
      })
    }
  },
})
