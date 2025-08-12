import type { Resolver } from '@nuxt/kit'

export * from './runtime/shared-types'

/**
 * WebSocket connection configuration options
 */
export type NuxtEasyWebSocketConnectionOptions = {
  /**
   * Toggle automatic opening of the WebSocket connection on client load
   * @default true
   */
  autoConnect?: boolean

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

  /**
   * Add a heartbeat handler on the Server that terminates unalive connections
   */
  heartbeat?: {
    /**
     * Toggle the heartbeat functionality
     * @default true
     */
    active?: boolean

    /**
     * Amount the server waits to check if peers are alive
     * @default 30_000
     */
    timeoutMs?: number
  }
}

/**
 * Main configuration options for the NuxtEasyWebSocket module.
 * Defines directories, routing behavior, WebSocket settings, and external connections.
 */
export type NuxtEasyWebSocketModuleOptions = {
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
    url: string | null
    ws?: Omit<NuxtEasyWebSocketConnectionOptions, 'heartbeat'>
  }>
}

/**
 * Represents a WebSocket route configuration with its file path, route path, and name
 */
export type NuxtEasyWebSocketRoute = { filePath: string, routePath: string, name: string, type: string }

/**
 * Internal context for the NuxtEasyWebSocket module
 * Contains all necessary utilities, options, and route collections
 */
export interface NuxtEasyWebSocketContext {
  resolver: Resolver
  logger: ReturnType<(typeof import('@nuxt/kit'))['useLogger']>
  userOptions: NuxtEasyWebSocketModuleOptions
  options: Required<NuxtEasyWebSocketModuleOptions>
  clientRoutes: {
    default: NuxtEasyWebSocketRoute[]
  } & {
    [key: string]: NuxtEasyWebSocketRoute[]
  }
  serverRoutes: NuxtEasyWebSocketRoute[]
  serverConnection: NuxtEasyWebSocketRoute[]
  watchingPaths: string[]
}

/**
 * Internal helper
 */
type DeepRequired<T> = {
  [P in keyof T]-?: DeepRequired<T[P]>
}

export interface NuxtEasyWebSocketPublicRuntimeConfig {
  /**
   * Overwritten at build time, used to pass options to runtime
   *
   * @internal
   */
  ws: DeepRequired<NuxtEasyWebSocketModuleOptions['ws']>

  /**
   * Overwritten at build time, used to pass options to runtime
   *
   * @internal
   */
  externalSockets?: NuxtEasyWebSocketModuleOptions['externalSockets']
}

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    easyWebSocket: NuxtEasyWebSocketPublicRuntimeConfig
  }
}
