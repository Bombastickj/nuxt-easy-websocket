import http from 'node:http'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, url } from '@nuxt/test-utils/e2e'

/** Performs a raw HTTP → WebSocket upgrade handshake so tests can inspect
 *  rejection status codes, which the WHATWG `WebSocket` API hides. */
function attemptUpgrade(
  httpUrl: string,
  headers: Record<string, string> = {},
): Promise<{ upgraded: boolean, statusCode?: number }> {
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
        ...headers,
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

describe('ws.originCheck: false', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/origin-check-disabled', import.meta.url)),
    browser: false,
  })

  it('should allow a foreign-Origin upgrade when the built-in check is disabled', async () => {
    const result = await attemptUpgrade(url('/_ws'), {
      Origin: 'https://evil.example.com',
    })
    expect(result.upgraded).toBe(true)
    expect(result.statusCode).toBe(101)
  })
})