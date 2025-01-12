import type { Peer } from 'crossws'
import type { EasyWSClientRoutes } from '#nuxt-easy-websocket/routes'

export class EasyWSServerPeer {
  peer: Peer

  constructor(peer: Peer) {
    this.peer = peer
  }

  send<T extends keyof EasyWSClientRoutes>(name: T, data: EasyWSClientRoutes[T], options?: { compress?: boolean }) {
    return this.peer.send(JSON.stringify({ name, data }), options)
  }

  publish<T extends keyof EasyWSClientRoutes>(topic: T, data: EasyWSClientRoutes[T], options?: { compress?: boolean }) {
    return this.peer.publish(topic, JSON.stringify({ name: topic, data }), options)
  }

  subscribe<T extends keyof EasyWSClientRoutes>(topic: T) {
    return this.peer.subscribe(topic)
  }
}
