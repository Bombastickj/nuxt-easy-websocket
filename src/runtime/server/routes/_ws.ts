import type { Peer, Message } from 'crossws'
// @ts-expect-error: Unreachable code error
import { defineWebSocketHandler } from '#imports'
import { serverConnection, serverEvents } from '#easy-websocket-server'
import type { EasyWSServerToClientEvents } from '#easy-websocket-client'

export class EasyWSServerPeer {
  peer: Peer

  constructor(peer: Peer) {
    this.peer = peer
  }

  send<T extends keyof EasyWSServerToClientEvents>(name: T, data?: EasyWSServerToClientEvents[T], options?: { compress?: boolean }) {
    return this.peer.send(JSON.stringify({ name, data }), options)
  }

  publish<T extends keyof EasyWSServerToClientEvents>(topic: T, data: EasyWSServerToClientEvents[T], options?: { compress?: boolean }) {
    return this.peer.publish(topic, JSON.stringify({ name: topic, data }), options)
  }

  subscribe<T extends keyof EasyWSServerToClientEvents>(topic: T) {
    return this.peer.subscribe(topic)
  }
}

export default defineWebSocketHandler({
  async open(peer: Peer) {
    console.log('[ServerSocket]: Connected: ', peer.id)
    const openCon = serverConnection.filter(con => con.type === 'open')

    const ewsPeer = new EasyWSServerPeer(peer)
    for (const con of openCon) {
      await con.handler({ peer: ewsPeer })
    }
  },
  async message(peer: Peer, message: Message) {
    console.log('[ServerSocket]:', message.json())
    const { name, data } = message.json() as { name: string, data: unknown }

    const eventModule = serverEvents.find(e => e.name === name)
    if (eventModule) {
      const ewsPeer = new EasyWSServerPeer(peer)

      // Execute the handler associated with the event
      await eventModule.handler({ data, peer: ewsPeer })
    }
    else {
      console.log('Event not found')
    }
  },
  async close(peer: Peer) {
    console.log('[ServerSocket]: Disconnect: ' + peer)
    const closeCon = serverConnection.filter(con => con.type === 'close')

    const ewsPeer = new EasyWSServerPeer(peer)
    for (const con of closeCon) {
      await con.handler({ peer: ewsPeer })
    }
  },
})
