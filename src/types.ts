export * from './runtime/shared-types'

/**
 * Main configuration options for the NuxtEasyWebSocket module.
 * Defines directories, routing behavior, WebSocket settings, and external connections.
 */
export type NuxtEasyWebSocketOptions = {
  /**
   * Change the default directory for reading **.{js|ts} files inside src directory
   * @default 'socket'
   */
  clientSrcDir: string

  /**
   * Change the default directory for reading **.{js|ts} files inside server directory
   * @default 'socket'
   */
  serverSrcDir: string

  /**
   * Change the default delimiter for client and server routes
   * @default '/'
   */
  delimiter: '/' | ':'

  ws: {
    /**
     * Maximum number of reconnection attempts when connection is lost
     * @default 10
     */
    maxReconnectAttempts?: number

    /**
     * Delay in milliseconds between reconnection attempts
     * @default 5000
     */
    reconnectDelay?: number

    /**
     * Whether to automatically attempt reconnection when connection closes
     * @default true
     */
    reconnectOnClose?: boolean
  }
}

/**
 * Represents a WebSocket route configuration with its file path, route path, and name
 */
export type NuxtEasyWebSocketRoute = { filePath: string, routePath: string, name: string }

export interface NuxtEasyWebSocketPublicRuntimeConfig {
  /**
   * Overwritten at build time, used to pass options to runtime
   *
   * @internal
   */
  ws: Required<NuxtEasyWebSocketOptions['ws']>
}

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    easyWebSocket: NuxtEasyWebSocketPublicRuntimeConfig
  }
}
