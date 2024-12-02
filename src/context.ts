import { createResolver, useLogger } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'

import { NUXT_EASY_WEBSOCKET_MODULE_ID } from './constants'
import type { NuxtEasyWebSocketOptions, EasyWSEventRaw } from './types'

export interface NuxtEasyWebSocketContext {
  resolver: Resolver
  logger: ReturnType<(typeof import('@nuxt/kit'))['useLogger']>
  userOptions: NuxtEasyWebSocketOptions
  options: Required<NuxtEasyWebSocketOptions>
  clientEvents: EasyWSEventRaw[]
  serverEvents: EasyWSEventRaw[]
  serverConnection: EasyWSEventRaw[]
}

// const debug = createDebug('@nuxtjs/i18n:context')
const resolver = createResolver(import.meta.url)

export function createContext(userOptions: NuxtEasyWebSocketOptions): NuxtEasyWebSocketContext {
  const options = userOptions as Required<NuxtEasyWebSocketOptions>

  return {
    resolver,
    logger: useLogger(NUXT_EASY_WEBSOCKET_MODULE_ID),
    userOptions,
    options,
    clientEvents: [],
    serverEvents: [],
    serverConnection: [],
  }
}