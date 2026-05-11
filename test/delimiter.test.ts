import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, url } from '@nuxt/test-utils/e2e'

interface WSMessage {
  name: string
  data?: unknown
}

describe('websocket delimiter', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/delimiter', import.meta.url)),
    browser: false,
  })

  it('should support custom delimiter', async () => {
    const wsUrl = url('/_ws').replace('http', 'ws')
    const ws = new WebSocket(wsUrl)
    const messages: WSMessage[] = []
    ws.onmessage = (event) => messages.push(JSON.parse(event.data.toString()))
    await new Promise(resolve => ws.onopen = resolve)

    ws.send(JSON.stringify({
      name: 'chat:send',
      data: { msg: 'hello delimiter' }
    }))

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timed out waiting for chat:msg')), 2000)
      const interval = setInterval(() => {
        if (messages.find(m => m.name === 'chat:msg')) {
          clearInterval(interval)
          clearTimeout(timeout)
          resolve(true)
        }
      }, 100)
    })

    const chatMsg = messages.find(m => m.name === 'chat:msg')
    expect(chatMsg).toMatchObject({
      name: 'chat:msg',
      data: { msg: 'hello delimiter' }
    })

    ws.close()
  })
})
