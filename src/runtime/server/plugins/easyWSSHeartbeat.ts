import { defineNitroPlugin, EasyWSSConnections, useRuntimeConfig } from '#imports'

export default defineNitroPlugin(() => {
  const options = useRuntimeConfig().public.easyWebSocket.ws
  if (!options.heartbeat.active) {
    return
  }

  const timeoutMs = options.heartbeat.timeoutMs

  // Initialize heartbeat on server
  const _heartbeatTimer = setInterval(() => {
    for (const ewsPeer of EasyWSSConnections.values()) {
      const peer = ewsPeer.peer

      if (!peer.isAlive) {
        peer.terminate() // this calls the close inside _ws.ts
        continue
      }
      peer.isAlive = false
      peer.send('_heartbeat')
    }
  }, timeoutMs)

  // Clean up on process exit
  process.on('exit', () => clearInterval(_heartbeatTimer))
})
