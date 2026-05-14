export type {
  EasyWSBinaryPayload,
  EasyWSRawPayload,
  EasyWSInboundPayload,
  EasyWSOutboundPayload,
} from './binary'

export type {
  EasyWSClientArgs,
  EasyWSClientState,
  EasyWSClientEvent,
  EasyWSClientEventHandlerRequest,
  EasyWSClientEventHandler,
  EasyWSClientEventGenerated,
} from './client'

export type {
  EasyWSServerArgs,
  EasyWSServerArgsOptions,
  EasyWSServerConnection,
  EasyWSServerConnectionHandler,
  EasyWSServerEvent,
  EasyWSServerEventHandlerPeer,
  EasyWSServerEventHandlerRequest,
  EasyWSServerEventHandler,
  EasyWSServerEventGenerated,
  EasyWSServerConnectionGenerated,
} from './server'

// Extend Peer with 'isAlive'
declare module 'crossws' {
  interface Peer {
    isAlive: boolean
  }
}