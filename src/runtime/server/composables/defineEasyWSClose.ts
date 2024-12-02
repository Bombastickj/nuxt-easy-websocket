import type { EasyWSServerConnectionGenerated, EasyWSServerConnectionHandler } from '../../shared-types'

export function defineEasyWSClose(handler: EasyWSServerConnectionHandler): EasyWSServerConnectionGenerated {
  return { type: 'close', handler }
}
