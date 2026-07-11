import type { Peer, Message, WSError } from 'crossws'
import { defineWebSocketHandler } from 'h3'

import { useRuntimeConfig } from '#imports'
import { serverConnection, serverRoutes, serverUpgrade } from '#nuxt-easy-websocket/server'

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

/**
 * Validates the Origin header against the request's Host header.
 * Returns true if the origin is valid (same host), false otherwise.
 */
function isOriginAllowed(request: Request): boolean {
  const origin = request.headers.get('origin')

  // No origin header — likely a non-browser client (curl, Postman, etc).
  // Non-browser clients don't send Origin headers and aren't vulnerable to CSWSH.
  if (!origin) return true

  const host = request.headers.get('host')
  if (!host) return false

  try {
    const originUrl = new URL(origin)
    // Compare the hostname (without port) to the Host header's hostname.
    // The Host header may include a port (e.g. "localhost:3000"),
    // so we strip it for comparison.
    const hostHostname = host.replace(/:\d+$/, '')
    return originUrl.hostname === hostHostname
  } catch {
    // Malformed Origin header — reject
    return false
  }
}

export default defineWebSocketHandler({
  async upgrade(request) {
    const config = useRuntimeConfig().public.easyWebSocket

    // Built-in origin check (enabled by default)
    if (config.ws.originCheck && !isOriginAllowed(request)) {
      throw new Response(null, {
        status: 403,
        statusText: 'Forbidden: origin not allowed',
      })
    }

    // Run user-defined upgrade handlers (from server/socket/upgrade.ts)
    let mergedHeaders: Headers | undefined
    let mergedContext: Record<string, unknown> | undefined

    for (const hook of serverUpgrade) {
      const result = await hook.handler(request)

      // Handler threw a Response or returned one — propagate to reject the upgrade
      if (result instanceof Response) {
        throw result
      }

      if (result) {
        // Merge headers from all upgrade handlers
        if (result.headers) {
          if (!mergedHeaders) mergedHeaders = new Headers()
          const entries = result.headers instanceof Headers
            ? result.headers.entries()
            : Array.isArray(result.headers)
              ? result.headers
              : Object.entries(result.headers)
          for (const [key, value] of entries) {
            mergedHeaders.set(key, value)
          }
        }

        // Merge context from all upgrade handlers
        if (result.context) {
          mergedContext = { ...mergedContext, ...result.context }
        }
      }
    }

    // Return merged results if any upgrade handler returned data
    if (mergedHeaders || mergedContext) {
      return {
        ...(mergedHeaders ? { headers: mergedHeaders } : {}),
        ...(mergedContext ? { context: mergedContext } : {}),
      }
    }
  },

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

