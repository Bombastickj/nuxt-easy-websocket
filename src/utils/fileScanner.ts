import fs from 'node:fs'
import { readFile } from 'node:fs/promises'
import pathe from 'pathe'
import { camelCase } from 'scule'
import { extractGenericFromFile } from './oxc'

import type { NuxtEasyWebSocketContext, NuxtEasyWebSocketRoute } from '../types'

type ScanOptions = {
  recursive?: boolean
  fileRegex?: RegExp
}

/**
 * Recursively scans a directory for .ts or .js files that export 'default'.
 * @param ctx - The NuxtEasyWebSocketContext
 * @param dir - The directory to scan.
 * @param scanOptions - Optional settings to control scanning behavior.
 * @param scanOptions.recursive - Whether to scan subdirectories (true by default).
 * @param scanOptions.fileRegex - Optional regex pattern to filter filenames.
 * @returns An array of objects containing the resolved file path and its corresponding route path.
 */
export async function scanDir(
  ctx: NuxtEasyWebSocketContext,
  dir: string,
  scanOptions: ScanOptions = {},
) {
  const { resolver, options } = ctx
  const { recursive = true, fileRegex = undefined } = scanOptions

  const fullDir = resolver.resolve(dir)
  const dirExists = await fs.promises
    .stat(fullDir)
    .then(stat => stat.isDirectory())
    .catch(() => false)
  if (!dirExists) return []

  // found events
  const events: NuxtEasyWebSocketRoute[] = []

  /**
   * Recursively traverses directories and scans for files exporting 'default'.
   * @param currentDir - The current directory being traversed.
   * @param baseDir - The base directory to compute relative paths.
   */
  const traverseDir = async (currentDir: string, baseDir: string | undefined = undefined) => {
    if (!baseDir) baseDir = currentDir

    // go through each entry (dir/file)
    const entries = await fs.promises.readdir(currentDir, { withFileTypes: true })
    for (const entry of entries) {
      const entryPath = pathe.join(currentDir, entry.name)

      if (entry.isDirectory() && recursive) await traverseDir(entryPath, baseDir)
      else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
        // Check if filename matches the regex pattern if provided
        if (fileRegex && !fileRegex.test(entry.name)) continue

        const code = await readFile(entryPath, { encoding: 'utf8' })
        const type = extractGenericFromFile(entryPath, code)

        // Found a valid ts/js file
        // Compute the file path without extension
        const filePath = entryPath.split(/\.(ts|js)$/)[0]!

        // Compute the relative path from the baseDir
        const routePathRaw = pathe.relative(baseDir, filePath)

        const name = camelCase(routePathRaw)
        const routePath = routePathRaw.replace(
          new RegExp(pathe.sep, 'g'),
          options.delimiter,
        )

        events.push({ filePath, routePath, name, type })
      }
    }
  }

  await traverseDir(fullDir)
  return events
}
