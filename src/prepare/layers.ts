import fs from 'node:fs'
import pathe from 'pathe'
import defu from 'defu'
import { findExportNames } from 'mlly'
import { camelCase } from 'scule'
import type { Nuxt } from '@nuxt/schema'
import type { NuxtEasyWebSocketContext, NuxtEasyWebSocketRoute } from '../types'

export async function prepareLayers(
  { resolver, options, clientRoutes, serverRoutes, serverConnection, watchingPaths }: NuxtEasyWebSocketContext,
  nuxt: Nuxt,
) {
  /**
   * Recursively scans a directory for .ts or .js files that export 'default'.
   * @param dir - The directory to scan.
   * @param _options - Optional settings to control scanning behavior.
   * @param _options.recursive - Whether to scan subdirectories (true by default).
   * @param _options.fileRegex - Optional regex pattern to filter filenames.
   * @returns An array of objects containing the resolved file path and its corresponding route path.
   */
  const scanDirectory = async (dir: string, _options?: {
    recursive?: boolean
    fileRegex?: RegExp
  }): Promise<NuxtEasyWebSocketRoute[]> => {
    const defaultOptions: {
      recursive?: boolean
      fileRegex?: RegExp
    } = { recursive: true, fileRegex: undefined }
    const { recursive, fileRegex } = defu(defaultOptions, _options)

    const fullDir = resolver.resolve(dir)
    const dirExists = await fs.promises
      .stat(fullDir)
      .then(stat => stat.isDirectory())
      .catch(() => false)
    if (!dirExists) return []

    const events: NuxtEasyWebSocketRoute[] = []

    /**
     * Recursively traverses directories and scans for files exporting 'default'.
     * @param currentDir - The current directory being traversed.
     * @param baseDir - The base directory to compute relative paths.
     */
    const traverse = async (currentDir: string, baseDir: string) => {
      const entries = await fs.promises.readdir(currentDir, { withFileTypes: true })
      for (const entry of entries) {
        const entryPath = pathe.join(currentDir, entry.name)
        if (entry.isDirectory()) {
          if (recursive) {
            await traverse(entryPath, baseDir)
          }
        }
        else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
          // Check if filename matches the regex pattern if provided
          if (fileRegex && !fileRegex.test(entry.name)) {
            continue
          }

          try {
            const fileContent = await fs.promises.readFile(entryPath, 'utf-8')
            const exports = findExportNames(fileContent)

            if (exports.includes('default')) {
              // Compute the file path without extension
              const filePath = entryPath.replace(/\.(ts|js)$/, '')

              // Compute the relative path from the baseDir
              const routePathRaw = pathe.relative(baseDir, filePath)
              const name = camelCase(routePathRaw)
              const routePath = (options.delimiter !== '/')
                ? routePathRaw.replace(/\//g, options.delimiter)
                : routePathRaw

              events.push({ filePath, routePath, name })
            }
          }
          catch (error) {
            console.warn(`Failed to parse exports from ${entryPath}:`, error)
          }
        }
      }
    }

    await traverse(fullDir, fullDir)
    return events
  }

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
    clientRoutes['default'].push(...await scanDirectory(clientSrcDir))
    serverRoutes.push(...await scanDirectory(serverApiSrcDir))
    serverConnection.push(
      ...await scanDirectory(serverSrcDir, {
        recursive: false,
        fileRegex: /^(open|close)\.(ts|js)$/,
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
          clientRoutes[socketName] = await scanDirectory(externalClientDir)
        }
        else {
          // Add empty external entry, to still init a connection
          clientRoutes[socketName] = []
        }
      }
    }
  }
}
