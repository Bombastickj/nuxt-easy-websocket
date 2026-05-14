import type { Peer, Message, WSError } from 'crossws'
import { defineWebSocketHandler } from 'h3'

import { useRuntimeConfig } from '#imports'
import { serverConnection, serverRoutes } from '#nuxt-easy-websocket/server'

import { EASY_WS_RAW_BINARY_EVENT, EASY_WS_RAW_TEXT_EVENT } from '../../shared/events'
import { tryParseMessageEnvelope } from '../../shared/message-envelope'
import { isEasyWSBinaryFrame, parseEasyWSBinaryFrame } from '../../shared/binary-frame'
import { EasyWSPeer } from '../utils/EasyWSPeer'
import { EasyWSConnections } from '../utils/EasyWSConnections'

async function dispatchServerEvent(
  peer: Peer,
  name: string,
  data: unknown,
) {
  const eventModule = serverRoutes.find(e => e.name === name)

  if (!eventModule) {
    console.log('[ServerSocket]:', `Event not found: ${name}`)
    return
  }

  const ewsPeer = EasyWSConnections.get(peer.id)

  if (!ewsPeer) {
    console.log('[ServerSocket]:', 'Peer not found')
    return
  }

  await eventModule.handler({ data, peer: ewsPeer })
}

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
    try {
      // _heartbeat functionality active
      const heartbeatActive = useRuntimeConfig().public.easyWebSocket.ws.heartbeat.active
      const raw = message.rawData

      if (typeof raw === 'string') {
        // definitely a text frame
        if (heartbeatActive && raw === '_heartbeat') {
          peer.isAlive = true
          return
        }

        const envelope = tryParseMessageEnvelope(raw)

        if (envelope) {
          await dispatchServerEvent(peer, envelope.name, envelope.data)
          return
        }

        await dispatchServerEvent(peer, EASY_WS_RAW_TEXT_EVENT, raw)
        return
      }

      // From here, treat as binary-like.
      const bytes = message.uint8Array()

      if (isEasyWSBinaryFrame(bytes)) {
        const frame = parseEasyWSBinaryFrame(bytes)
        await dispatchServerEvent(peer, frame.name, frame.data)
        return
      }

      await dispatchServerEvent(peer, EASY_WS_RAW_BINARY_EVENT, bytes)
    } catch (error) {
      console.error(
        '[ServerSocket]: Error processing message:',
        error instanceof Error ? error.message : error,
      )
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
