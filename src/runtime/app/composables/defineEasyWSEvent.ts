import type { Serialize, Simplify } from 'nitropack/types'
import type {
  EasyWSBinaryPayload,
  EasyWSClientEventHandler,
  EasyWSClientEventHandlerRequest,
} from '../../shared-types'

type EasyWSRuntimePayload<T> = T extends EasyWSBinaryPayload
  ? T
  : Simplify<Serialize<T>>

export function defineEasyWSEvent<
  Request extends EasyWSClientEventHandlerRequest,
>(
  handler: EasyWSClientEventHandler<EasyWSRuntimePayload<Request>>,
): EasyWSClientEventHandler<Request> {
  return handler as EasyWSClientEventHandler<Request>
}
