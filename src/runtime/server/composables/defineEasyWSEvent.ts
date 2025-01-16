import type { Serialize, Simplify } from 'nitropack/types'
import type { EasyWSServerEventHandler, EasyWSServerEventHandlerRequest } from '../../shared-types'

export function defineEasyWSEvent<
  Request extends EasyWSServerEventHandlerRequest,
>(handler: EasyWSServerEventHandler<Simplify<Serialize<Request>>>): EasyWSServerEventHandler<Request> {
  return handler as EasyWSServerEventHandler<Request>
}
