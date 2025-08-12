import type { EasyWSServerConnectionHandler } from '../../shared-types'
import type { EasyWSServerPeer } from '../utils/EasyWSServerPeer'

export function defineEasyWSConnection(
  handler: EasyWSServerConnectionHandler<EasyWSServerPeer>,
): EasyWSServerConnectionHandler<EasyWSServerPeer> {
  return handler
}
