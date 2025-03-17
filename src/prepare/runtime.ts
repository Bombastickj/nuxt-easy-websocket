import defu from 'defu'
import { addImports, addPlugin, addServerImports, addServerHandler } from '@nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import type { NuxtEasyWebSocketContext } from '../types'

export function prepareRuntime({ resolver, options }: NuxtEasyWebSocketContext, nuxt: Nuxt) {
  // Add runtime configuration
  nuxt.options.runtimeConfig.public.easyWebSocket = defu(
    nuxt.options.runtimeConfig.public.easyWebSocket,
    {
      ws: options.ws,
    },
  )

  // client composables
  addImports([
    {
      from: resolver.resolve('./runtime/app/composables/defineEasyWSEvent'),
      name: 'defineEasyWSEvent',
    },
    {
      from: resolver.resolve('./runtime/app/composables/useEasyWS'),
      name: 'useEasyWS',
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
  ])

  // server websocket handler
  addServerHandler({
    route: '/_ws',
    handler: resolver.resolve('./runtime/server/routes/_ws'),
  })
}
