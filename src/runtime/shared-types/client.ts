// ─────────────── Clientside types ─────────────── //
// If payload can be undefined, make 'data' optional; otherwise require it.
export type EasyWSClientArgs<TYPE, KEY extends keyof TYPE>
  = undefined extends TYPE[KEY]
    ? [name: KEY, data?: Exclude<TYPE[KEY], undefined>]
    : [name: KEY, data: TYPE[KEY]]

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
