import http from 'node:http'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, url, $fetch } from '@nuxt/test-utils/e2e'

interface WSMessage {
  name: string
  data?: unknown
}

interface Stats {
  connections: number
}

function withQuery(httpUrl: string, query: Record<string, string>): string {
  const target = new URL(httpUrl)
  for (const [key, value] of Object.entries(query)) {
    target.searchParams.set(key, value)
  }
  return target.toString()
}

/** Performs a raw HTTP → WebSocket upgrade handshake so tests can inspect
 *  rejection status codes, which the WHATWG `WebSocket` API hides. */
function attemptUpgrade(httpUrl: string): Promise<{ upgraded: boolean, statusCode?: number }> {
  return new Promise((resolve, reject) => {
    const target = new URL(httpUrl)
    const req = http.request({
      hostname: target.hostname,
      port: target.port,
      path: target.pathname + target.search,
      headers: {
        Connection: 'Upgrade',
        Upgrade: 'websocket',
        'Sec-WebSocket-Key': crypto.randomBytes(16).toString('base64'),
        'Sec-WebSocket-Version': '13',
      },
    })
    req.on('upgrade', (res, socket) => {
      socket.on('error', () => {})
      socket.end()
      resolve({ upgraded: true, statusCode: res.statusCode })
    })
    req.on('response', (res) => {
      res.resume()
      resolve({ upgraded: false, statusCode: res.statusCode })
    })
    req.on('error', reject)
    req.end()
  })
}

describe('custom upgrade hook', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/upgrade', import.meta.url)),
    browser: false,
  })

  it('should reject an upgrade with no token', async () => {
    const result = await attemptUpgrade(url('/_ws'))
    expect(result.upgraded).toBe(false)
    expect(result.statusCode).toBe(401)
  })

  it('should reject an upgrade with an invalid token', async () => {
    const result = await attemptUpgrade(withQuery(url('/_ws'), { token: 'wrong' }))
    expect(result.upgraded).toBe(false)
    expect(result.statusCode).toBe(401)
  })

  it('should not run the open handler for a rejected upgrade', async () => {
    const before = await $fetch<Stats>('/api/stats')

    await attemptUpgrade(withQuery(url('/_ws'), { token: 'wrong' }))
    await new Promise(resolve => setTimeout(resolve, 200))

    const after = await $fetch<Stats>('/api/stats')
    expect(after.connections).toBe(before.connections)
  })

  it('should accept an upgrade with a valid token and expose it via peer.context', async () => {
    const before = await $fetch<Stats>('/api/stats')

    const wsUrl = withQuery(url('/_ws'), { token: 'let-me-in' }).replace('http', 'ws')
    const ws = new WebSocket(wsUrl)

    const welcome = await new Promise<WSMessage>((resolve) => {
      ws.onmessage = (event) => {
        const data = event.data.toString()
        if (data === '_heartbeat') return
        resolve(JSON.parse(data))
      }
    })

    expect(welcome).toMatchObject({
      name: 'welcome',
      data: { user: 'let-me-in' },
    })

    const after = await $fetch<Stats>('/api/stats')
    expect(after.connections).toBe(before.connections + 1)

    ws.close()
    await new Promise(resolve => setTimeout(resolve, 100))
  })
})