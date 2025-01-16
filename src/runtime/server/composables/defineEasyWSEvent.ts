import type { Serialize } from 'nitropack/types'
import type { EasyWSServerEventHandler, EasyWSServerEventHandlerRequest } from '../../shared-types'

export function defineEasyWSEvent<
  Request extends EasyWSServerEventHandlerRequest,
>(handler: EasyWSServerEventHandler<Serialize<Request>>): EasyWSServerEventHandler<Serialize<Request>> {
  return handler
}
