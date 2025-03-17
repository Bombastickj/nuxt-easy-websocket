import type { Resolver } from '@nuxt/kit'

export * from './runtime/shared-types'

/**
 * WebSocket connection configuration options
 */
export type NuxtEasyWebSocketConnectionOptions = {
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

  /**
   * Change the websocket behaviour
   */
  ws: NuxtEasyWebSocketConnectionOptions

  /**
   * Add external websockets
   */
  externalSockets?: Record<string, {
    url: string
    ws?: NuxtEasyWebSocketConnectionOptions
  }>
}

/**
 * Represents a WebSocket route configuration with its file path, route path, and name
 */
export type NuxtEasyWebSocketRoute = { filePath: string, routePath: string, name: string }

/**
 * Internal context for the NuxtEasyWebSocket module
 * Contains all necessary utilities, options, and route collections
 */
export interface NuxtEasyWebSocketContext {
  resolver: Resolver
  logger: ReturnType<(typeof import('@nuxt/kit'))['useLogger']>
  userOptions: NuxtEasyWebSocketOptions
  options: Required<NuxtEasyWebSocketOptions>
  clientRoutes: Record<string, NuxtEasyWebSocketRoute[]>
  serverRoutes: NuxtEasyWebSocketRoute[]
  serverConnection: NuxtEasyWebSocketRoute[]
  watchingPaths: string[]
}

export interface NuxtEasyWebSocketPublicRuntimeConfig {
  /**
   * Overwritten at build time, used to pass options to runtime
   *
   * @internal
   */
  ws: Required<NuxtEasyWebSocketOptions['ws']>

  /**
   * Overwritten at build time, used to pass options to runtime
   *
   * @internal
   */
  externalSockets?: NuxtEasyWebSocketOptions['externalSockets']
}

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    easyWebSocket: NuxtEasyWebSocketPublicRuntimeConfig
  }
}
