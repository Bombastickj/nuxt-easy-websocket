import fs from 'node:fs'
import pathe from 'pathe'
import { findExportNames } from 'mlly'
import { camelCase } from 'scule'
import type { Nuxt } from '@nuxt/schema'
import type { NuxtEasyWebSocketContext } from '../context'
import type { EasyWSRouteRaw } from '../types'

export async function prepareLayers(
  { resolver, options, clientRoutes, serverRoutes, serverConnection, watchingPaths }: NuxtEasyWebSocketContext,
  nuxt: Nuxt,
) {
  /**
   * Recursively scans a directory for .ts or .js files that exports 'default'.
   * @param dir - The directory to scan.
   * @param recursive - Optional setting to control scanning behavior.
   * @returns An array of objects containing the resolved file path and its corresponding route path.
   */
  const scanDirectory = async (dir: string, recursive: boolean = true): Promise<EasyWSRouteRaw[]> => {
    const fullDir = resolver.resolve(dir)
    const dirExists = await fs.promises
      .stat(fullDir)
      .then(stat => stat.isDirectory())
      .catch(() => false)
    if (!dirExists) return []

    const events: EasyWSRouteRaw[] = []

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
    clientRoutes.push(...await scanDirectory(clientSrcDir))
    serverRoutes.push(...await scanDirectory(serverApiSrcDir))
    serverConnection.push(...await scanDirectory(serverSrcDir, false))
  }
}
