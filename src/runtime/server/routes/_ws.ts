import type { Peer, Message, WSError } from 'crossws'
import { EasyWSServerPeer } from '../utils/EasyWSServerPeer'
// @ts-expect-error: Unreachable code error
import { defineWebSocketHandler, EasyWSSConnections } from '#imports'
import { serverConnection, serverRoutes } from '#nuxt-easy-websocket/server'

export default defineWebSocketHandler({
  async open(peer: Peer) {
    // console.log('[ServerSocket]: Connected: ', peer.id)

    const ewsPeer = new EasyWSServerPeer(peer)
    EasyWSSConnections.set(peer.id, ewsPeer)

    const openCon = serverConnection.filter(con => con.type === 'open')
    for (const con of openCon) {
      await con.handler({ peer: ewsPeer })
    }
  },
  async message(peer: Peer, message: Message) {
    // console.log('[ServerSocket]:', message.json())
    const { name, data } = message.json() as { name: string, data: unknown }

    const eventModule = serverRoutes.find(e => e.name === name)
    if (eventModule) {
      const ewsPeer = EasyWSSConnections.get(peer.id)

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
    // console.log('[ServerSocket]: Disconnect: ' + peer)
    const closeCon = serverConnection.filter(con => con.type === 'close')

    const ewsPeer = EasyWSSConnections.get(peer.id)
    EasyWSSConnections.delete(peer.id)

    if (ewsPeer) {
      for (const con of closeCon) {
        await con.handler({ peer: ewsPeer })
      }
    }
  },
  async error(peer: Peer, _error: WSError) {
    const errorCon = serverConnection.filter(con => con.type === 'error')

    const ewsPeer = EasyWSSConnections.get(peer.id)
    EasyWSSConnections.delete(peer.id)

    if (ewsPeer) {
      for (const con of errorCon) {
        await con.handler({ peer: ewsPeer })
      }
    }
  },
})
