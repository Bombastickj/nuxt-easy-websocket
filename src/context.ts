import { createResolver, useLogger } from '@nuxt/kit'
import { NUXT_EASY_WEBSOCKET_MODULE_ID } from './constants'

import type {
  NuxtEasyWebSocketModuleOptions,
  NuxtEasyWebSocketContext,
} from './types'

export function createContext(
  userOptions: NuxtEasyWebSocketModuleOptions,
): NuxtEasyWebSocketContext {
  const options = userOptions as Required<NuxtEasyWebSocketModuleOptions>
  const resolver = createResolver(import.meta.url)

  return {
    resolver,
    logger: useLogger(NUXT_EASY_WEBSOCKET_MODULE_ID),
    userOptions,
    options,
    layers: [],
    clientRoutes: new Map([['default', new Map()]]),
    serverRoutes: new Map(),
    serverConnection: new Map(),
  }
}
