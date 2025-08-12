import type { EasyWSServerConnectionHandler } from '../../shared-types'
import type { EasyWSPeer } from '../utils/EasyWSPeer'

export function defineEasyWSConnection(
  handler: EasyWSServerConnectionHandler<EasyWSPeer>,
): EasyWSServerConnectionHandler<EasyWSPeer> {
  return handler
}
