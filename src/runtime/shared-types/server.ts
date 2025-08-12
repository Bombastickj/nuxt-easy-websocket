// ─────────────── Server types ─────────────── //
// EasyWSServerConnection
export interface EasyWSServerConnection<Peer = unknown> {
  peer: Peer // InstanceType<typeof EasyWSPeer>
}
export interface EasyWSServerConnectionHandler<Peer = unknown> {
  (event: EasyWSServerConnection<Peer>): Promise<void> | void
}

// EasyWSServerEvent
export interface EasyWSServerEvent<Peer, Request>
  extends EasyWSServerConnection<Peer> {
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
