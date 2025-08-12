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
