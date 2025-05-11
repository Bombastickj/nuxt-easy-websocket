import fs from 'node:fs'
import pathe from 'pathe'
import defu from 'defu'
import { findExportNames } from 'mlly'
import { camelCase } from 'scule'

import type { NuxtEasyWebSocketContext, NuxtEasyWebSocketRoute } from '../types'

type ScanOptions = {
  recursive?: boolean
  fileRegex?: RegExp
}

/**
 * Recursively scans a directory for .ts or .js files that export 'default'.
 * @param ctx - The NuxtEasyWebSocketContext
 * @param dir - The directory to scan.
 * @param _options - Optional settings to control scanning behavior.
 * @param _options.recursive - Whether to scan subdirectories (true by default).
 * @param _options.fileRegex - Optional regex pattern to filter filenames.
 * @returns An array of objects containing the resolved file path and its corresponding route path.
 */
export async function scanDirectory(
  ctx: NuxtEasyWebSocketContext,
  dir: string,
  _options?: ScanOptions,
): Promise<NuxtEasyWebSocketRoute[]> {
  const { recursive, fileRegex } = defu<ScanOptions, [ScanOptions | undefined]>({ recursive: true, fileRegex: undefined }, _options)

  const fullDir = ctx.resolver.resolve(dir)
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
        if (recursive) await traverse(entryPath, baseDir)
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

            // Split the relative path into segments
            // const segments = routePathRaw.split(pathe.sep)
            // const lastSegment = segments[segments.length - 1]
            // // If the last segment starts with "index", remove that prefix (and an optional following dot)
            // if (lastSegment.startsWith('index')) {
            //   segments[segments.length - 1] = lastSegment.replace(/^index(?:\.|$)/, '')
            //   // Filter out any empty segments (if the file was exactly "index")
            //   routePathRaw = segments.filter(Boolean).join(pathe.sep)
            // }

            const name = camelCase(routePathRaw)
            const routePath = routePathRaw.replace(
              new RegExp(pathe.sep, 'g'),
              ctx.options.delimiter,
            )

            events.push({ filePath, routePath, name })
          }
        }
        catch (error) {
          ctx.logger.warn(`Failed to parse exports from ${entryPath}:`, error)
        }
      }
    }
  }

  await traverse(fullDir, fullDir)
  return events
}
