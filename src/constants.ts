export const NUXT_EASY_WEBSOCKET_MODULE_ID = 'nuxt-easy-websocket'

export const MODULE_TMP_PATH = {
  plugin: 'types/nuxt-easy-websocket-plugin.d.ts',
  routes: 'types/nuxt-easy-websocket-routes.d.ts',

  clientEvents: 'module/nuxt-easy-websocket-client.mts',
  clientEventTypes: 'module/nuxt-easy-websocket-client.d.ts',

  serverEvents: 'module/nuxt-easy-websocket-server.mts',
  serverEventTypes: 'module/nuxt-easy-websocket-server.d.ts',
} as const

export const SCRIPT_EXT_RE = /\.(ts|js)$/i
export const SERVER_CONN_BASENAME_RE = /^(open|close|error)\.(ts|js)$/i
