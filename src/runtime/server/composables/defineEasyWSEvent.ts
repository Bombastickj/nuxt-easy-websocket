import type { Serialize, Simplify } from 'nitropack/types'
import type { EasyWSServerEventHandler, EasyWSServerEventHandlerRequest } from '../../shared-types'
import type { EasyWSPeer } from '../utils/EasyWSPeer'

export function defineEasyWSEvent<
  Request extends EasyWSServerEventHandlerRequest,
>(
  handler: EasyWSServerEventHandler<EasyWSPeer, Simplify<Serialize<Request>>>,
): EasyWSServerEventHandler<EasyWSPeer, Request> {
  return handler as EasyWSServerEventHandler<EasyWSPeer, Request>
}
