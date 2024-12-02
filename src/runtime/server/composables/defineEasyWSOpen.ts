import type { EasyWSServerConnectionGenerated, EasyWSServerConnectionHandler } from '../../shared-types'

export function defineEasyWSOpen(handler: EasyWSServerConnectionHandler): EasyWSServerConnectionGenerated {
  return { type: 'open', handler }
}
