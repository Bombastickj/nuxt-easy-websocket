import type { Peer, Message, WSError } from 'crossws'
import { EasyWSPeer } from '../utils/EasyWSPeer'
// @ts-expect-error: Nuxt auto-imports may not be generated in some editor states
import { defineWebSocketHandler, EasyWSConnections, useRuntimeConfig } from '#imports'
import { serverConnection, serverRoutes } from '#nuxt-easy-websocket/server'

export default defineWebSocketHandler({
  async open(peer: Peer) {
    // console.log('[ServerSocket]: Connected: ', peer.id)

    // init heartbeat liveness for each new connection
    peer.isAlive = true

    const ewsPeer = new EasyWSPeer(peer)
    EasyWSConnections.set(peer.id, ewsPeer)

    const openCon = serverConnection.filter(con => con.type === 'open')
    for (const con of openCon) {
      await con.handler({ peer: ewsPeer })
    }
  },
  async message(peer: Peer, message: Message) {
    // console.log('[ServerSocket]:', message.json())

    // _heartbeat functionality
    const runtimeConfig = useRuntimeConfig()
    const heartbeatActive = runtimeConfig.public.easyWebSocket.ws.heartbeat
    if (heartbeatActive && message.text() === '_heartbeat') {
      peer.isAlive = true
      return
    }

    const { name, data } = message.json() as { name: string, data: never }

    const eventModule = serverRoutes.find(e => e.name === name)
    if (eventModule) {
      const ewsPeer = EasyWSConnections.get(peer.id)

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

    const ewsPeer = EasyWSConnections.get(peer.id)
    EasyWSConnections.delete(peer.id)

    if (ewsPeer) {
      for (const con of closeCon) {
        await con.handler({ peer: ewsPeer })
      }
    }
  },
  async error(peer: Peer, _error: WSError) {
    const errorCon = serverConnection.filter(con => con.type === 'error')

    const ewsPeer = EasyWSConnections.get(peer.id)
    EasyWSConnections.delete(peer.id)

    if (ewsPeer) {
      for (const con of errorCon) {
        await con.handler({ peer: ewsPeer })
      }
    }
  },
})
