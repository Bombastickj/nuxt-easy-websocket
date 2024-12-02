import type { EasyWSServerEventHandler, EasyWSServerEventHandlerRequest } from '../../shared-types'

export function defineEasyWSEvent<
  Request extends EasyWSServerEventHandlerRequest,
>(handler: EasyWSServerEventHandler<Request>): EasyWSServerEventHandler<Request> {
  return handler
}
