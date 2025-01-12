import type { EasyWSServerPeer } from './server/routes/_ws'

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
}

export type EasyWSEventRaw = { imports: string, exports: string, name: string }

// EasyWSClientEvent
export interface EasyWSClientEvent<Request> {
  data: Request
}
export type EasyWSClientEventHandlerRequest<T = unknown> = T
export interface EasyWSClientEventHandler<
  Request extends EasyWSClientEventHandlerRequest = EasyWSClientEventHandlerRequest,
> {
  (event: EasyWSClientEvent<Request>): Promise<void> | void
}

// EasyWSServerOpen
export interface EasyWSServerConnection {
  peer: InstanceType<typeof EasyWSServerPeer>
}
export interface EasyWSServerConnectionHandler {
  (event: EasyWSServerConnection): Promise<void> | void
}

// EasyWSServerEvent
// export type EasyWSServerPeer = import ('crossws').Peer & { send }
export interface EasyWSServerEvent<Request> extends EasyWSServerConnection {
  data: Request
}
export type EasyWSServerEventHandlerRequest<T = unknown> = T
export interface EasyWSServerEventHandler<
  Request extends EasyWSServerEventHandlerRequest = EasyWSServerEventHandlerRequest,
> {
  (event: EasyWSServerEvent<Request>): Promise<void> | void
}

// generated client & server
export interface EasyWSClientEventGenerated<T = unknown> {
  name: string
  handler: EasyWSClientEventHandler<T>
}
export interface EasyWSServerConnectionGenerated {
  type: 'open' | 'close'
  handler: EasyWSServerConnectionHandler
}
export interface EasyWSServerEventGenerated<T = unknown> {
  name: string
  handler: EasyWSServerEventHandler<T>
}
