import type { EasyWSClientEventHandler, EasyWSClientEventHandlerRequest } from '../shared-types'

export function defineEasyWSClientEvent<
  Request extends EasyWSClientEventHandlerRequest,
>(handler: EasyWSClientEventHandler<Request>): EasyWSClientEventHandler<Request> {
  return handler
}
