import defu from 'defu'
import { defineNuxtModule } from '@nuxt/kit'
import { NUXT_EASY_WEBSOCKET_MODULE_ID } from './constants'
import type { NuxtEasyWebSocketOptions } from './types'
import { createContext } from './context'
import { prepareLayers } from './prepare/layers'
import { generateClientEvents, generateServerEvents } from './gen'
import { prepareRuntime } from './prepare/runtime'

export default defineNuxtModule<NuxtEasyWebSocketOptions>({
  meta: {
    name: NUXT_EASY_WEBSOCKET_MODULE_ID,
    configKey: 'easyWebSocket',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    serverSrcDir: 'socket',
    clientSrcDir: 'socket',
  },
  async setup(_options, _nuxt) {
    const ctx = createContext(_options)

    prepareRuntime(ctx)

    _nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.experimental = defu(nitroConfig.experimental, {
        websocket: true,
      })
    })

    await prepareLayers(ctx, _nuxt)
    generateClientEvents(ctx, _nuxt)
    generateServerEvents(ctx, _nuxt)
  },
})
