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
 * A route map keyed by the **normalized absolute file path without extension**.
 *
 * @remarks
 * - Keys are absolute, normalized (platform separators) and extension-less.
 * - `Map` preserves insertion order, which the generators will respect.
 * - Values are {@link NuxtEasyWebSocketRoute} descriptors.
 */
export type RouteMap = Map<string /* resolved no-ext abs path */, NuxtEasyWebSocketRoute>

/**
 * Per-layer metadata used to classify changed files during dev/HMR.
 */
export type NuxtEasyWebSocketLayerMeta = {
  /**
   * Absolute path to the layer's client socket directory
   * (usually `<layer>/app/<clientSrcDir>`).
   */
  clientDir: string

  /**
   * Absolute path to the layer's server API directory scanned for server routes
   * (usually `<layer>/server/<serverSrcDir>/api`).
   */
  serverApiDir: string

  /**
   * Absolute path to the layer's server socket root
   * (usually `<layer>/server/<serverSrcDir>`), used to pick up `open|close|error`.
   */
  serverDir: string

  /**
   * Map of external socket namespace → absolute client directory
   * (e.g. `<layer>/app/<namespace>`), if present in the layer.
   */
  externalClientDirs: Record<string, string> // socketName -> abs dir
}

/**
 * Internal context for the NuxtEasyWebSocket module
 * Contains all necessary utilities, options, and route collections
 */
export interface NuxtEasyWebSocketContext {
  resolver: Resolver
  logger: ReturnType<(typeof import('@nuxt/kit'))['useLogger']>
  userOptions: NuxtEasyWebSocketModuleOptions
  options: Required<NuxtEasyWebSocketModuleOptions>

  layers: NuxtEasyWebSocketLayerMeta[]
  clientRoutes: Map<'default' | (string & {}), RouteMap>
  serverRoutes: RouteMap
  serverConnection: RouteMap
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
