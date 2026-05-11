import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, url, $fetch } from '@nuxt/test-utils/e2e'

interface WSMessage {
  name: string
  data?: unknown
}

interface Stats {
  connections: number
  disconnections: number
  errors: number
}

describe('websocket communication', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/websocket', import.meta.url)),
    browser: false,
  })

  it('should connect and receive welcome message', async () => {
    const wsUrl = url('/_ws').replace('http', 'ws')
    const ws = new WebSocket(wsUrl)

    const messagePromise = new Promise<WSMessage>((resolve) => {
      ws.onmessage = (event) => {
        resolve(JSON.parse(event.data.toString()))
      }
    })

    const welcome = await messagePromise
    expect(welcome).toMatchObject({
      name: 'welcome',
      data: expect.objectContaining({
        id: expect.any(String)
      })
    })

    ws.close()
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  it('should ping and pong', async () => {
    const wsUrl = url('/_ws').replace('http', 'ws')
    const ws = new WebSocket(wsUrl)

    const messages: WSMessage[] = []
    ws.onmessage = (event) => {
      messages.push(JSON.parse(event.data.toString()))
    }

    // Wait for connection
    await new Promise((resolve) => {
      ws.onopen = resolve
    })

    // Send ping
    ws.send(JSON.stringify({
      name: 'ping',
      data: { msg: 'hello' }
    }))

    // Wait for pong
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        clearInterval(interval)
        reject(new Error('Timed out waiting for pong. Messages received: ' + JSON.stringify(messages)))
      }, 2000)
      const interval = setInterval(() => {
        if (messages.find(m => m.name === 'pong')) {
          clearInterval(interval)
          clearTimeout(timeout)
          resolve(true)
        }
      }, 100)
    })

    const pong = messages.find(m => m.name === 'pong')
    expect(pong).toMatchObject({
      name: 'pong',
      data: { msg: 'hello' }
    })

    ws.close()
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  it('should support pub/sub', async () => {
    const wsUrl = url('/_ws').replace('http', 'ws')
    
    // Client 1: Subscriber
    const ws1 = new WebSocket(wsUrl)
    const messages1: WSMessage[] = []
    ws1.onmessage = (event) => {
      messages1.push(JSON.parse(event.data.toString()))
    }
    await new Promise(resolve => ws1.onopen = resolve)

    // Client 2: Publisher
    const ws2 = new WebSocket(wsUrl)
    await new Promise(resolve => ws2.onopen = resolve)

    // ws1 subscribes to 'news'
    ws1.send(JSON.stringify({
      name: 'subscribe',
      data: { topic: 'news' }
    }))

    // Wait for subscription confirmation
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timed out waiting for subscribed. Messages: ' + JSON.stringify(messages1))), 2000)
      const interval = setInterval(() => {
        if (messages1.find(m => m.name === 'subscribed')) {
          clearInterval(interval)
          clearTimeout(timeout)
          resolve(true)
        }
      }, 100)
    })

    // ws2 publishes to 'news'
    ws2.send(JSON.stringify({
      name: 'publish',
      data: { topic: 'news', msg: 'breaking news' }
    }))

    // ws1 should receive the message
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timed out waiting for news. Messages: ' + JSON.stringify(messages1))), 2000)
      const interval = setInterval(() => {
        if (messages1.find(m => m.name === 'news')) {
          clearInterval(interval)
          clearTimeout(timeout)
          resolve(true)
        }
      }, 100)
    })

    const news = messages1.find(m => m.name === 'news')
    expect(news).toMatchObject({
      name: 'news',
      data: { msg: 'breaking news' }
    })

    ws1.close()
    ws2.close()
    await new Promise(resolve => setTimeout(resolve, 200))
  })

  it('should track connections and disconnections', async () => {
    const wsUrl = url('/_ws').replace('http', 'ws')
    
    // Get stats before connecting
    const statsBefore = await $fetch<Stats>('/api/stats')
    
    const ws = new WebSocket(wsUrl)
    await new Promise(resolve => ws.onopen = resolve)
    
    // Check connections incremented
    const statsAfterOpen = await $fetch<Stats>('/api/stats')
    expect(statsAfterOpen.connections).toBe(statsBefore.connections + 1)

    ws.close()
    
    // Wait a bit for close handler to run
    await new Promise(resolve => setTimeout(resolve, 500))

    const statsAfterClose = await $fetch<Stats>('/api/stats')
    expect(statsAfterClose.disconnections).toBe(statsBefore.disconnections + 1)
  })

  it('should support subdirectory events', async () => {
    const wsUrl = url('/_ws').replace('http', 'ws')
    const ws = new WebSocket(wsUrl)
    const messages: WSMessage[] = []
    ws.onmessage = (event) => messages.push(JSON.parse(event.data.toString()))
    await new Promise(resolve => ws.onopen = resolve)

    ws.send(JSON.stringify({
      name: 'chat/send',
      data: { msg: 'hello chat' }
    }))

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timed out waiting for chat/msg')), 2000)
      const interval = setInterval(() => {
        if (messages.find(m => m.name === 'chat/msg')) {
          clearInterval(interval)
          clearTimeout(timeout)
          resolve(true)
        }
      }, 100)
    })

    const chatMsg = messages.find(m => m.name === 'chat/msg')
    expect(chatMsg).toMatchObject({
      name: 'chat/msg',
      data: { msg: 'hello chat' }
    })

    ws.close()
  })

  it('should receive heartbeat from server', async () => {
    const wsUrl = url('/_ws').replace('http', 'ws')
    const ws = new WebSocket(wsUrl)
    const messages: string[] = []
    ws.onmessage = (event) => messages.push(event.data.toString())
    await new Promise(resolve => ws.onopen = resolve)

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timed out waiting for heartbeat')), 3000)
      const interval = setInterval(() => {
        if (messages.includes('_heartbeat')) {
          clearInterval(interval)
          clearTimeout(timeout)
          resolve(true)
        }
      }, 100)
    })

    expect(messages).toContain('_heartbeat')
    ws.close()
  })

  it('should remain connected after handler error', async () => {
    const wsUrl = url('/_ws').replace('http', 'ws')
    const ws = new WebSocket(wsUrl)
    await new Promise(resolve => ws.onopen = resolve)

    ws.send(JSON.stringify({
      name: 'crash'
    }))

    // Wait a bit to ensure it doesn't close
    await new Promise(resolve => setTimeout(resolve, 500))

    expect(ws.readyState).toBe(WebSocket.OPEN)
    
    // Can still ping
    const messagePromise = new Promise<WSMessage>((resolve) => {
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data.toString()) as WSMessage
        if (msg.name === 'pong') resolve(msg)
      }
    })
    ws.send(JSON.stringify({ name: 'ping', data: { msg: 'still here' } }))
    const pong = await messagePromise
    expect(pong).toMatchObject({ name: 'pong', data: { msg: 'still here' } })

    ws.close()
  })
})
