// Extend Peer with 'isAlive'
declare module 'crossws' {
  interface Peer {
    isAlive: boolean
  }
}

// ─────────────── Clientside types ─────────────── //
export interface EasyWSClientState {
  reconnectCountdown: number | null
  lastError: string | null
  connectionAttempts: number
  readyState: number
}

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

// ─────────────── Server types ─────────────── //
// EasyWSServerConnection
export interface EasyWSServerConnection<Peer = unknown> {
  peer: Peer // InstanceType<typeof EasyWSServerPeer>
}
export interface EasyWSServerConnectionHandler<Peer = unknown> {
  (event: EasyWSServerConnection<Peer>): Promise<void> | void
}

// EasyWSServerEvent
export interface EasyWSServerEvent<Peer, Request> extends EasyWSServerConnection<Peer> {
  data: Request
}
export type EasyWSServerEventHandlerPeer<T = unknown> = T
export type EasyWSServerEventHandlerRequest<T = unknown> = T
export interface EasyWSServerEventHandler<
  Peer extends EasyWSServerEventHandlerPeer = EasyWSServerEventHandlerPeer,
  Request extends EasyWSServerEventHandlerRequest = EasyWSServerEventHandlerRequest,
> {
  (event: EasyWSServerEvent<Peer, Request>): Promise<void> | void
}

// ─────────────── Generated types ─────────────── //
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
