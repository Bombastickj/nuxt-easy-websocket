import type { Peer, Message } from 'crossws'
import { EasyWSServerPeer } from '../utils/EasyWSServerPeer'
// @ts-expect-error: Unreachable code error
import { defineWebSocketHandler, easyWSConnections } from '#imports'
import { serverConnection, serverRoutes } from '#nuxt-easy-websocket/server'

export default defineWebSocketHandler({
  async open(peer: Peer) {
    console.log('[ServerSocket]: Connected: ', peer.id)

    const ewsPeer = new EasyWSServerPeer(peer)
    easyWSConnections.set(peer.id, ewsPeer)

    const openCon = serverConnection.filter(con => con.type === 'open')
    for (const con of openCon) {
      await con.handler({ peer: ewsPeer })
    }
  },
  async message(peer: Peer, message: Message) {
    console.log('[ServerSocket]:', message.json())
    const { name, data } = message.json() as { name: string, data: unknown }

    const eventModule = serverRoutes.find(e => e.name === name)
    if (eventModule) {
      const ewsPeer = easyWSConnections.get(peer.id)

      if (ewsPeer) {
        // Execute the handler associated with the event
        await eventModule.handler({ data, peer: ewsPeer })
      }
      else {
        console.log('[ServerSocket]:', 'Peer not found')
      }
    }
    else {
      console.log('[ServerSocket]:', 'Event not found')
    }
  },
  async close(peer: Peer) {
    console.log('[ServerSocket]: Disconnect: ' + peer)
    const closeCon = serverConnection.filter(con => con.type === 'close')

    const ewsPeer = easyWSConnections.get(peer.id)
    easyWSConnections.delete(peer.id)

    if (ewsPeer) {
      for (const con of closeCon) {
        await con.handler({ peer: ewsPeer })
      }
    }
    else {
      console.log('[ServerSocket]:', 'Peer not found')
    }
  },
})
