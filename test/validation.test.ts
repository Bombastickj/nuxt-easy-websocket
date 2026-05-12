import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, url } from '@nuxt/test-utils/e2e'

interface WSMessage {
  name: string
  data?: unknown
}

describe('websocket validation', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/validation', import.meta.url)),
    browser: false,
  })

  it('should accept valid data with safe handler', async () => {
    const wsUrl = url('/_ws').replace('http', 'ws')
    const ws = new WebSocket(wsUrl)

    const messages: WSMessage[] = []
    ws.onmessage = (event) => {
      const data = event.data.toString()
      if (data === '_heartbeat') return
      messages.push(JSON.parse(data))
    }

    await new Promise((resolve) => ws.onopen = resolve)

    ws.send(JSON.stringify({
      name: 'safe-ping',
      data: { msg: 'hello' }
    }))

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timed out waiting for pong')), 2000)
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
  })

  it('should reject invalid data with safe handler', async () => {
    const wsUrl = url('/_ws').replace('http', 'ws')
    const ws = new WebSocket(wsUrl)

    const messages: WSMessage[] = []
    ws.onmessage = (event) => {
      const data = event.data.toString()
      if (data === '_heartbeat') return
      messages.push(JSON.parse(data))
    }

    await new Promise((resolve) => ws.onopen = resolve)

    // msg too short (min 3)
    ws.send(JSON.stringify({
      name: 'safe-ping',
      data: { msg: 'hi' }
    }))

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timed out waiting for error')), 2000)
      const interval = setInterval(() => {
        if (messages.find(m => m.name === 'error')) {
          clearInterval(interval)
          clearTimeout(timeout)
          resolve(true)
        }
      }, 100)
    })

    const error = messages.find(m => m.name === 'error')
    expect(error).toMatchObject({
      name: 'error',
      data: {
        message: 'Invalid data',
        errors: expect.any(Object)
      }
    })

    ws.close()
  })

  it('should reject wrong type with safe handler', async () => {
    const wsUrl = url('/_ws').replace('http', 'ws')
    const ws = new WebSocket(wsUrl)

    const messages: WSMessage[] = []
    ws.onmessage = (event) => {
      const data = event.data.toString()
      if (data === '_heartbeat') return
      messages.push(JSON.parse(data))
    }

    await new Promise((resolve) => ws.onopen = resolve)

    // msg is a number, should be string
    ws.send(JSON.stringify({
      name: 'safe-ping',
      data: { msg: 123 }
    }))

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timed out waiting for error')), 2000)
      const interval = setInterval(() => {
        if (messages.find(m => m.name === 'error')) {
          clearInterval(interval)
          clearTimeout(timeout)
          resolve(true)
        }
      }, 100)
    })

    const error = messages.find(m => m.name === 'error')
    expect(error).toMatchObject({
      name: 'error',
      data: {
        message: 'Invalid data'
      }
    })

    ws.close()
  })

  it('should handle complex valid data', async () => {
    const wsUrl = url('/_ws').replace('http', 'ws')
    const ws = new WebSocket(wsUrl)

    const messages: WSMessage[] = []
    ws.onmessage = (event) => {
      const data = event.data.toString()
      if (data === '_heartbeat') return
      messages.push(JSON.parse(data))
    }

    await new Promise((resolve) => ws.onopen = resolve)

    ws.send(JSON.stringify({
      name: 'safe-complex',
      data: { 
        user: { id: 1, name: 'John' },
        tags: ['a', 'b', 'c']
      }
    }))

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timed out waiting for complex-pong')), 2000)
      const interval = setInterval(() => {
        if (messages.find(m => m.name === 'complex-pong')) {
          clearInterval(interval)
          clearTimeout(timeout)
          resolve(true)
        }
      }, 100)
    })

    const pong = messages.find(m => m.name === 'complex-pong')
    expect(pong).toMatchObject({
      name: 'complex-pong',
      data: { 
        receivedName: 'John',
        tagCount: 3
      }
    })

    ws.close()
  })
})
