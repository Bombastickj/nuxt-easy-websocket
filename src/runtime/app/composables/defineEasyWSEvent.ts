import type { Serialize, Simplify } from 'nitropack/types'
import type { EasyWSClientEventHandler, EasyWSClientEventHandlerRequest } from '../../shared-types'

export function defineEasyWSEvent<
  Request extends EasyWSClientEventHandlerRequest,
>(
  handler: EasyWSClientEventHandler<Simplify<Serialize<Request>>>,
): EasyWSClientEventHandler<Request> {
  return handler as EasyWSClientEventHandler<Request>
}
