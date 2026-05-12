import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, url } from '@nuxt/test-utils/e2e'

interface WSMessage {
  name: string
  data?: unknown
}

describe('websocket custom directories', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/dirs', import.meta.url)),
    browser: false,
  })

  it('should support custom serverSrcDir', async () => {
    const wsUrl = url('/_ws').replace('http', 'ws')
    const ws = new WebSocket(wsUrl)
    const messages: WSMessage[] = []
    ws.onmessage = (event) => {
      const data = event.data.toString()
      if (data === '_heartbeat') return
      messages.push(JSON.parse(data))
    }
    await new Promise(resolve => ws.onopen = resolve)

    ws.send(JSON.stringify({
      name: 'ping',
      data: { msg: 'hello custom dir' }
    }))

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timed out waiting for custom-pong')), 2000)
      const interval = setInterval(() => {
        if (messages.find(m => m.name === 'custom-pong')) {
          clearInterval(interval)
          clearTimeout(timeout)
          resolve(true)
        }
      }, 100)
    })

    const pong = messages.find(m => m.name === 'custom-pong')
    expect(pong).toMatchObject({
      name: 'custom-pong',
      data: { msg: 'hello custom dir' }
    })

    ws.close()
  })
})
