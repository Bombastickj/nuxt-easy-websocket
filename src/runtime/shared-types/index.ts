export type {
  EasyWSClientState,
  EasyWSClientEvent,
  EasyWSClientEventHandlerRequest,
  EasyWSClientEventHandler,
} from './client'

export type {
  EasyWSServerConnection,
  EasyWSServerConnectionHandler,
  EasyWSServerEvent,
  EasyWSServerEventHandlerPeer,
  EasyWSServerEventHandlerRequest,
  EasyWSServerEventHandler,
} from './server'

// Extend Peer with 'isAlive'
declare module 'crossws' {
  interface Peer {
    isAlive: boolean
  }
}
