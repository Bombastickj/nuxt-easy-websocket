import type { Peer, Message } from 'crossws'
import { EasyWSServerPeer } from '../utils/EasyWSServerPeer'
// @ts-expect-error: Unreachable code error
import { defineWebSocketHandler } from '#imports'
import { serverConnection, serverRoutes } from '#nuxt-easy-websocket/server'

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

    const eventModule = serverRoutes.find(e => e.name === name)
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
