import fs from 'node:fs'
import pathe from 'pathe'
import type { Nuxt } from '@nuxt/schema'
import type { NuxtEasyWebSocketContext } from '../types'
import { scanDirectory } from '../utils/fileScanner'

export async function prepareLayers(
  ctx: NuxtEasyWebSocketContext,
  nuxt: Nuxt,
) {
  const { resolver, options, clientRoutes, serverRoutes, serverConnection, watchingPaths } = ctx

  // Go through each layer and find the socket directory
  const _layers = [...nuxt.options._layers].reverse()
  for (const layer of _layers) {
    const clientSrcDir = pathe.join(layer.config.srcDir, layer.config.easyWebSocket?.clientSrcDir || options.clientSrcDir)
    const serverSrcDir = pathe.join(layer.config.serverDir || nuxt.options.serverDir, layer.config.easyWebSocket?.serverSrcDir || options.serverSrcDir)
    const serverApiSrcDir = pathe.join(serverSrcDir, '/api')

    // Add paths to watcher
    watchingPaths.push(
      pathe.relative(nuxt.options.rootDir, clientSrcDir),
      pathe.relative(nuxt.options.rootDir, serverSrcDir),
    )

    // Scan client and server directories
    clientRoutes['default'].push(...await scanDirectory(ctx, clientSrcDir))
    serverRoutes.push(...await scanDirectory(ctx, serverApiSrcDir))
    serverConnection.push(
      ...await scanDirectory(ctx, serverSrcDir, {
        recursive: false,
        fileRegex: /^(open|close|error)\.(ts|js)$/,
      }),
    )

    // Process external sockets if configured
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
          // Add external directory to watcher
          watchingPaths.push(
            pathe.relative(nuxt.options.rootDir, externalClientDir),
          )

          // Scan for event handlers with the socket name as namespace
          clientRoutes[socketName] = await scanDirectory(ctx, externalClientDir)
        }
        else {
          // Add empty external entry, to still init a connection
          clientRoutes[socketName] = []
        }
      }
    }
  }
}
