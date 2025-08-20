import fs from 'node:fs'
import pathe from 'pathe'
import type { Nuxt } from '@nuxt/schema'
import type { NuxtEasyWebSocketContext } from '../types'
import { scanDir } from '../utils/fileScanner'

export async function prepareLayers(
  ctx: NuxtEasyWebSocketContext,
  nuxt: Nuxt,
) {
  const { resolver, options, clientRoutes, layers } = ctx

  // Go through each layer and find the socket directory
  const _layers = [...nuxt.options._layers].reverse()
  for (const layer of _layers) {
    const clientSrcDir = resolver.resolve(layer.config.srcDir, layer.config.easyWebSocket?.clientSrcDir || options.clientSrcDir)
    const serverSrcDir = resolver.resolve(layer.config.serverDir || nuxt.options.serverDir, layer.config.easyWebSocket?.serverSrcDir || options.serverSrcDir)
    const serverApiSrcDir = pathe.join(serverSrcDir, '/api')

    // Scan client and server directories
    const scannedClientDefault = await scanDir(ctx, clientSrcDir)
    clientRoutes.set('default', scannedClientDefault)
    
    const scannedServerRoutes = await scanDir(ctx, serverApiSrcDir)
    ctx.serverRoutes = scannedServerRoutes

    const scannedServerConn = await scanDir(ctx, serverSrcDir, {
      recursive: false,
      fileRegex: /^(open|close|error)\.(ts|js)$/,
    })
    ctx.serverConnection = scannedServerConn

    // Process external sockets if configured
    const externalClientDirs: Record<string, string> = {}
    if (options.externalSockets) {
      for (const [socketName] of Object.entries(options.externalSockets)) {
        // Scan for external socket handlers in a subdirectory matching the socket name
        const externalClientDir = pathe.join(layer.config.srcDir, socketName)

        // Check if directory exists before trying to scan
        const externalDirExists = await fs.promises
          .stat(resolver.resolve(externalClientDir))
          .then(stat => stat.isDirectory())
          .catch(() => false)

        if (externalDirExists) {
          externalClientDirs[socketName] = resolver.resolve(externalClientDir)

          // Scan for event handlers with the socket name as namespace
          clientRoutes.set(socketName, await scanDir(ctx, externalClientDir))
        }
        else {
          // Add empty external entry, to still init a connection
          clientRoutes.set(socketName, new Map())
        }
      }
    }

    // Save per-layer meta for classification during HMR
    layers.push({
      clientDir: clientSrcDir,
      serverApiDir: serverApiSrcDir,
      serverDir: serverSrcDir,
      externalClientDirs,
    })
  }
}
