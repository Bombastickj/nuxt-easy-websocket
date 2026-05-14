import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, createPage } from '@nuxt/test-utils/e2e'

describe('browser binary E2E tests', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/websocket', import.meta.url)),
    browser: true,
  })

  const cases = [
    {
      name: 'ArrayBuffer',
      button: '#binary-arraybuffer-btn',
      expected: '1,2,3,4,5',
    },
    {
      name: 'Uint8Array',
      button: '#binary-uint8array-btn',
      expected: '6,7,8,9,10',
    },
    {
      name: 'DataView',
      button: '#binary-dataview-btn',
      expected: '11,12,13,14,15',
    },
    {
      name: 'Blob',
      button: '#binary-blob-btn',
      expected: '16,17,18,19,20',
    },
    {
      name: 'Int32Array',
      button: '#binary-int32-btn',
      expected: '21,0,0,0,22,0,0,0,23,0,0,0,24,0,0,0,25,0,0,0',
    },
  ]

  it.each(cases)(
    'should send and receive binary data using $name',
    async ({ button, expected }) => {
      const page = await createPage('/')

      await page.waitForSelector('#status:has-text("connected")', {
        timeout: 10000,
      })

      expect(await page.textContent('#status')).toBe('connected')

      await page.click(button)

      await page.waitForSelector(`#binary-echo:has-text("${expected}")`, {
        timeout: 5000,
      })

      expect(await page.textContent('#binary-echo')).toBe(expected)

      await page.close()
    },
    30000,
  )
})
