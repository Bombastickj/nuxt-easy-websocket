import { createResolver, useLogger } from '@nuxt/kit'

import { NUXT_EASY_WEBSOCKET_MODULE_ID } from './constants'
import type { NuxtEasyWebSocketOptions, NuxtEasyWebSocketContext } from './types'

// const debug = createDebug('@nuxtjs/i18n:context')
const resolver = createResolver(import.meta.url)

export function createContext(userOptions: NuxtEasyWebSocketOptions): NuxtEasyWebSocketContext {
  const options = userOptions as Required<NuxtEasyWebSocketOptions>

  return {
    resolver,
    logger: useLogger(NUXT_EASY_WEBSOCKET_MODULE_ID),
    userOptions,
    options,
    clientRoutes: [],
    serverRoutes: [],
    serverConnection: [],
    watchingPaths: [],
  }
}
