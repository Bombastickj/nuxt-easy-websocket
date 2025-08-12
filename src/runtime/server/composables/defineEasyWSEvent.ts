import type { Serialize, Simplify } from 'nitropack/types'
import type { EasyWSServerEventHandler, EasyWSServerEventHandlerRequest } from '../../shared-types'
import type { EasyWSServerPeer } from '../utils/EasyWSServerPeer'

export function defineEasyWSEvent<
  Request extends EasyWSServerEventHandlerRequest,
>(
  handler: EasyWSServerEventHandler<EasyWSServerPeer, Simplify<Serialize<Request>>>,
): EasyWSServerEventHandler<EasyWSServerPeer, Request> {
  return handler as EasyWSServerEventHandler<EasyWSServerPeer, Request>
}
