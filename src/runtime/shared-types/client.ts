import type { EasyWSInboundPayload, EasyWSOutboundPayload } from './binary'

// Binary route payloads accept ArrayBuffer, Uint8Array, DataView, Buffer, etc.
type EasyWSClientPayloadArg<T> = EasyWSOutboundPayload<Exclude<T, undefined>>

export type EasyWSClientArgs<TYPE, KEY extends keyof TYPE>
  = undefined extends TYPE[KEY]
    ? [name: KEY, data?: EasyWSClientPayloadArg<TYPE[KEY]>]
    : [name: KEY, data: EasyWSOutboundPayload<TYPE[KEY]>]

export interface EasyWSClientState {
  reconnectCountdown: number | null
  lastError: string | null
  isFirstConnectionAttempt: boolean
  connectionAttempts: number
  readyState: number
}

// EasyWSClientEvent
export interface EasyWSClientEvent<Request> {
  // Binary payloads are delivered as Uint8Array after frame parsing.
  data: EasyWSInboundPayload<Request>
}

export type EasyWSClientEventHandlerRequest<T = unknown> = T

export interface EasyWSClientEventHandler<
  Request extends EasyWSClientEventHandlerRequest = EasyWSClientEventHandlerRequest,
> {
  (event: EasyWSClientEvent<Request>): Promise<void> | void
}

export interface EasyWSClientEventGenerated<Request = unknown> {
  name: string
  handler: EasyWSClientEventHandler<Request>
}