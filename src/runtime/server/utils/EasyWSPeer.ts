import type { Peer } from 'crossws'
import type { EasyWSClientRoutes, EasyWSServerArguments } from '#nuxt-easy-websocket/routes'

export class EasyWSPeer {
  peer: Peer

  constructor(peer: Peer) {
    this.peer = peer
  }

  send(...args: EasyWSServerArguments) {
    const [name, data, options] = args
    const body = data === undefined ? { name } : { name, data }
    return this.peer.send(JSON.stringify(body), options)
  }

  publish(...args: EasyWSServerArguments) {
    const [name, data, options] = args
    const body = data === undefined ? { name } : { name, data }
    return this.peer.publish(name, JSON.stringify(body), options)
  }

  subscribe<T extends keyof EasyWSClientRoutes>(topic: T) {
    return this.peer.subscribe(topic)
  }
}
