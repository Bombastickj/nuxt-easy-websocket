import type { Serialize, Simplify } from 'nitropack/types'
import type {
  EasyWSBinaryPayload,
  EasyWSServerEventHandler,
  EasyWSServerEventHandlerRequest,
} from '../../shared-types'
import type { EasyWSPeer } from '../utils/EasyWSPeer'

type EasyWSRuntimePayload<T> = T extends EasyWSBinaryPayload
  ? T
  : Simplify<Serialize<T>>

export function defineEasyWSEvent<
  Request extends EasyWSServerEventHandlerRequest,
>(
  handler: EasyWSServerEventHandler<EasyWSPeer, EasyWSRuntimePayload<Request>>,
): EasyWSServerEventHandler<EasyWSPeer, Request> {
  return handler as EasyWSServerEventHandler<EasyWSPeer, Request>
}
