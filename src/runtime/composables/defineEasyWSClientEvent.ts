import type { Serialize } from 'nitropack/types'
import type { EasyWSClientEventHandler, EasyWSClientEventHandlerRequest } from '../shared-types'

export function defineEasyWSClientEvent<
  Request extends EasyWSClientEventHandlerRequest,
>(handler: EasyWSClientEventHandler<Serialize<Request>>): EasyWSClientEventHandler<Serialize<Request>> {
  return handler
}
