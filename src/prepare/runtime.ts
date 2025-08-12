import defu from 'defu'
import {
  addImports,
  addPlugin,
  addServerImports,
  addServerHandler,
  addServerPlugin,
} from '@nuxt/kit'

import type { Nuxt } from 'nuxt/schema'
import type { NuxtEasyWebSocketContext } from '../types'

export function prepareRuntime(ctx: NuxtEasyWebSocketContext, nuxt: Nuxt) {
  const { resolver, options } = ctx

  // Add runtime configuration
  nuxt.options.runtimeConfig.public.easyWebSocket = defu(
    nuxt.options.runtimeConfig.public.easyWebSocket,
    {
      ws: options.ws,
      externalSockets: options.externalSockets,
    },
  )

  // client composables
  addImports([
    {
      name: 'defineEasyWSEvent',
      as: 'defineEasyWSEvent',
      from: resolver.resolve('./runtime/app/composables/defineEasyWSEvent'),
    },
    {
      name: 'useEasyWS',
      as: 'useEasyWS',
      from: resolver.resolve('./runtime/app/composables/useEasyWS'),
    },
    {
      name: 'useExternalWS',
      as: 'useExternalWS',
      from: resolver.resolve('./runtime/app/composables/useExternalWS'),
    },
  ])

  // client websocket handler plugin
  addPlugin(resolver.resolve('./runtime/app/plugins/easyWS'), { append: true })

  // server composables
  addServerImports([
    {
      from: resolver.resolve('./runtime/server/composables/defineEasyWSSConnection'),
      name: 'defineEasyWSSConnection',
    },
    {
      from: resolver.resolve('./runtime/server/composables/defineEasyWSSEvent'),
      name: 'defineEasyWSSEvent',
    },
    {
      from: resolver.resolve('./runtime/server/utils/EasyWSSConnections'),
      name: 'EasyWSSConnections',
    },
    {
      from: resolver.resolve('./runtime/server/utils/EasyWSServerPeer'),
      name: 'EasyWSServerPeer',
    },
  ])

  // server heartbeat (if enabled)
  if (options.ws.heartbeat) {
    addServerPlugin(resolver.resolve('./runtime/server/plugins/easyWSSHeartbeat'))
  }

  // server websocket handler
  addServerHandler({
    route: '/_ws',
    handler: resolver.resolve('./runtime/server/routes/_ws'),
  })

  // activate nitro websocket
  nuxt.hook('nitro:config', (nitroConfig) => {
    nitroConfig.experimental = defu(nitroConfig.experimental, {
      websocket: true,
    })
  })
}
