import fs from 'node:fs'
import pathe from 'pathe'
import { scanDir } from '../utils/fileScanner'
import { SERVER_CONN_BASENAME_RE } from '../constants'

import type { Nuxt } from '@nuxt/schema'
import type { NuxtEasyWebSocketContext } from '../types'
import { getLayerDirectories } from '@nuxt/kit'

/** Adds only missing keys into the target map. */
function mergeMapsPreferExisting<K, V>(target: Map<K, V>, source: Map<K, V>) {
  for (const [k, v] of source) {
    if (!target.has(k)) target.set(k, v)
  }
  return target
}

export async function prepareLayers(ctx: NuxtEasyWebSocketContext, nuxt: Nuxt) {
  const { resolver, options, clientRoutes, layers } = ctx

  const layerDirs = getLayerDirectories()

  // Access directories from all layers
  for (const [index, layer] of layerDirs.entries()) {
    const layerCfg = nuxt.options._layers[index]?.config
    if (!layerCfg) continue

    const clientSrcDir = resolver.resolve(
      layer.app,
      (layerCfg.easyWebSocket ? layerCfg.easyWebSocket.clientSrcDir : undefined) || options.clientSrcDir,
    )
    const serverSrcDir = resolver.resolve(
      layer.server || nuxt.options.serverDir,
      (layerCfg.easyWebSocket ? layerCfg.easyWebSocket.serverSrcDir : undefined) || options.serverSrcDir,
    )
    const serverApiSrcDir = pathe.join(serverSrcDir, '/api')

    // Scan client and server directories
    const scannedClientDefault = await scanDir(ctx, clientSrcDir)
    const existingDefault = clientRoutes.get('default')!
    clientRoutes.set(
      'default',
      mergeMapsPreferExisting(existingDefault, scannedClientDefault),
    )

    const scannedServerRoutes = await scanDir(ctx, serverApiSrcDir)
    ctx.serverRoutes = mergeMapsPreferExisting(
      ctx.serverRoutes,
      scannedServerRoutes,
    )

    const scannedServerConn = await scanDir(ctx, serverSrcDir, {
      recursive: false,
      fileRegex: SERVER_CONN_BASENAME_RE,
    })
    ctx.serverConnection = mergeMapsPreferExisting(
      ctx.serverConnection,
      scannedServerConn,
    )

    // Process external sockets if configured
    const externalClientDirs: Record<string, string> = {}
    if (options.externalSockets) {
      for (const [socketName] of Object.entries(options.externalSockets)) {
        // Scan for external socket handlers in a subdirectory matching the socket name
        const externalClientDir = pathe.join(layer.app, socketName)

        // Check if directory exists before trying to scan
        const externalDirExists = await fs.promises
          .stat(resolver.resolve(externalClientDir))
          .then((stat) => stat.isDirectory())
          .catch(() => false)

        if (externalDirExists) {
          externalClientDirs[socketName] = resolver.resolve(externalClientDir)

          // Scan for event handlers with the socket name as namespace
          const scanned = await scanDir(ctx, externalClientDir)
          const existing = clientRoutes.get(socketName) ?? new Map()
          clientRoutes.set(
            socketName,
            mergeMapsPreferExisting(existing, scanned),
          )
        } else {
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
