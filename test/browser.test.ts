import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, createPage } from '@nuxt/test-utils/e2e'

describe('browser E2E tests', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/websocket', import.meta.url)),
    browser: true,
  })

  it('should connect and interact via useEasyWS', async () => {
    const page = await createPage('/')
    
    // Wait for connection
    await page.waitForSelector('#status:has-text("connected")', { timeout: 10000 })
    expect(await page.textContent('#status')).toBe('connected')
    
    // Check welcome message from server (triggered by open handler)
    await page.waitForSelector('#welcome:not(:empty)', { timeout: 5000 })
    expect(await page.textContent('#welcome')).toContain('welcome:')
    
    // Trigger ping
    await page.click('#ping-btn')
    
    // Wait for pong
    await page.waitForSelector('#pong:has-text("pong:browser-test")', { timeout: 5000 })
    expect(await page.textContent('#pong')).toBe('pong:browser-test')

    // Test external socket
    await page.click('#ext-btn')
    await page.waitForSelector('#external:has-text("external:external-test")', { timeout: 5000 })
    expect(await page.textContent('#external')).toBe('external:external-test')
  }, 30000)
})
