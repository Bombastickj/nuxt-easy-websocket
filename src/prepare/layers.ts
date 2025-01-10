import fs from 'node:fs'
import path from 'node:path'
import type { Nuxt } from '@nuxt/schema'
import type { NuxtEasyWebSocketContext } from '../context'
import type { EasyWSEventRaw } from '../types'

export async function prepareLayers(
  { resolver, options, clientEvents, serverEvents, serverConnection }: NuxtEasyWebSocketContext,
  nuxt: Nuxt,
) {
  // Function to scan event files and extract event definitions
  const scanEvents = async (dir: string, append?: string) => {
    const fullDir = resolver.resolve(dir)
    const dirExists = await fs.promises.stat(fullDir).then(stat => stat.isDirectory()).catch(() => false)
    if (!dirExists) return []

    const files = await fs.promises.readdir(fullDir)
    const events: EasyWSEventRaw[] = []

    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        let fileName: string | string[] = file.split('.')
        fileName.splice(-1)
        fileName = fileName.join()

        const filePath = resolver.resolve(fullDir, fileName)
        events.push({
          imports: `import ${fileName}${append ? append : ''} from '${filePath}';`,
          exports: `${fileName}${append ? append : ''}`,
          name: fileName,
        })
      }
    }

    return events
  }

  // Go through each layer and find the socket directory
  const _layers = [...nuxt.options._layers].reverse()
  for (const layer of _layers) {
    // Scan client and server events
    clientEvents.push(...await scanEvents(
      path.join(layer.config.srcDir, layer.config.easyWebSocket?.clientSrcDir || options.clientSrcDir),
      'Client',
    ))
    serverEvents.push(...await scanEvents(
      path.join(layer.config.serverDir || nuxt.options.serverDir, layer.config.easyWebSocket?.serverSrcDir || options.serverSrcDir, '/events'),
      'Server',
    ))
    serverConnection.push(...await scanEvents(
      path.join(layer.config.serverDir || nuxt.options.serverDir, layer.config.easyWebSocket?.serverSrcDir || options.serverSrcDir),
      'ConnectionOpen',
    ))
  }
}
