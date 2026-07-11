import type { EasyWSInboundPayload, EasyWSOutboundPayload } from './binary'

export type EasyWSServerArgsOptions = { compress?: boolean }

// Binary route payloads accept ArrayBuffer, Uint8Array, DataView, Buffer, etc.
type EasyWSServerPayloadArg<T> = EasyWSOutboundPayload<Exclude<T, undefined>>

export type EasyWSServerArgs<
  TYPE,
  KEY extends keyof TYPE,
  OPTIONS extends object = EasyWSServerArgsOptions,
>
  = undefined extends TYPE[KEY]
    ? [name: KEY, data?: EasyWSServerPayloadArg<TYPE[KEY]>, options?: OPTIONS]
    : [name: KEY, data: EasyWSOutboundPayload<TYPE[KEY]>, options?: OPTIONS]

// EasyWSServerConnection
export interface EasyWSServerConnection<Peer = unknown> {
  peer: Peer
}

export interface EasyWSServerConnectionHandler<Peer = unknown> {
  (event: EasyWSServerConnection<Peer>): Promise<void> | void
}

// EasyWSServerUpgrade
export interface EasyWSServerUpgradeResult {
  /** Additional headers to include in the upgrade response. */
  headers?: HeadersInit
  /** Custom context attached to the peer, accessible via `peer.context`. */
  context?: Record<string, unknown>
}

export interface EasyWSServerUpgradeHandler {
  (request: Request): Promise<EasyWSServerUpgradeResult | Response | undefined> | EasyWSServerUpgradeResult | Response | undefined
}

export interface EasyWSServerUpgradeGenerated {
  type: 'upgrade'
  handler: EasyWSServerUpgradeHandler
}

// EasyWSServerEvent
export interface EasyWSServerEvent<Peer, Request>
  extends EasyWSServerConnection<Peer> {
  // Binary payloads are delivered as Uint8Array after frame parsing.
  data: EasyWSInboundPayload<Request>
}

export type EasyWSServerEventHandlerPeer<T = unknown> = T
export type EasyWSServerEventHandlerRequest<T = unknown> = T

export interface EasyWSServerEventHandler<
  Peer extends EasyWSServerEventHandlerPeer = EasyWSServerEventHandlerPeer,
  Request extends EasyWSServerEventHandlerRequest = EasyWSServerEventHandlerRequest,
> {
  (event: EasyWSServerEvent<Peer, Request>): Promise<void> | void
}

export interface EasyWSServerEventGenerated<Request = unknown, Peer = unknown> {
  name: string
  handler: EasyWSServerEventHandler<Peer, Request>
}

export interface EasyWSServerConnectionGenerated<Peer = unknown> {
  type: 'open' | 'close' | 'error' | string
  handler: EasyWSServerConnectionHandler<Peer>
}