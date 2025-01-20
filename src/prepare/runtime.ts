import defu from 'defu'
import { addImports, addPlugin, addServerImports, addServerHandler } from '@nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import type { NuxtEasyWebSocketContext } from '../context'

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
      from: resolver.resolve('./runtime/composables/defineEasyWSClientEvent'),
      name: 'defineEasyWSClientEvent',
    },
    {
      from: resolver.resolve('./runtime/composables/useEasyWS'),
      name: 'useEasyWS',
    },
  ])

  // client websocket handler plugin
  addPlugin(resolver.resolve('./runtime/plugins/easyWS'))

  // server composables
  addServerImports([
    {
      from: resolver.resolve('./runtime/server/composables/defineEasyWSOpen'),
      name: 'defineEasyWSOpen',
    },
    {
      from: resolver.resolve('./runtime/server/composables/defineEasyWSClose'),
      name: 'defineEasyWSClose',
    },
    {
      from: resolver.resolve('./runtime/server/composables/defineEasyWSEvent'),
      name: 'defineEasyWSEvent',
    },
    {
      from: resolver.resolve('./runtime/server/utils/easyWSConnections'),
      name: 'easyWSConnections',
    },
  ])

  // server websocket handler
  addServerHandler({
    route: '/_ws',
    handler: resolver.resolve('./runtime/server/routes/_ws'),
  })
}
