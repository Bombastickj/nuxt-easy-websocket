import { access, readFile } from 'node:fs/promises'
import pathe from 'pathe'

import type { Nuxt } from 'nuxt/schema'
import type { NuxtEasyWebSocketContext } from '../types'

import { MIN_CROSSWS_VERSION, NUXT_EASY_WEBSOCKET_MODULE_ID } from '../constants'

type PackageJson = {
  name?: string
  version?: string
  packageManager?: string
}

type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun' | 'unknown'

type ResolvedCrossWS = {
  version: string
  packageJsonPath: string
  via: string
}

async function exists(path: string) {
  return access(path).then(() => true).catch(() => false)
}

async function readPackageJson(path: string): Promise<PackageJson | null> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as PackageJson
  } catch {
    return null
  }
}

async function readPackageVersion(packageJsonPath: string) {
  const pkg = await readPackageJson(packageJsonPath)
  return pkg?.version
}

function resolvePackageJsonFrom(
  packageName: string,
  fromDir: string,
): string | null {
  try {
    return pathe.resolve(fromDir, `${packageName}/package.json`)
  } catch {
    return null
  }
}

function resolvePackageJsonFromPackage(
  packageName: string,
  ownerPackageJsonPath: string,
): string | null {
  try {
    return pathe.resolve(ownerPackageJsonPath, `${packageName}/package.json`)
  } catch {
    return null
  }
}

function parseStableSemver(version: string) {
  const [withoutBuild] = version.trim().replace(/^v/, '').split('+')
  const [core, prerelease] = withoutBuild!.split('-', 2)
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(core!)

  if (!match) return null

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: Boolean(prerelease),
  }
}

function isLowerVersion(actual: string, minimum: string) {
  const a = parseStableSemver(actual)
  const b = parseStableSemver(minimum)

  // Be conservative: if parsing fails, do not claim it is lower.
  if (!a || !b) return false

  if (a.major !== b.major) return a.major < b.major
  if (a.minor !== b.minor) return a.minor < b.minor
  if (a.patch !== b.patch) return a.patch < b.patch

  // 0.4.5-beta.1 is lower than 0.4.5
  return a.prerelease && !b.prerelease
}

async function detectPackageManager(nuxt: Nuxt): Promise<PackageManager> {
  const dirs = [...new Set([nuxt.options.rootDir, nuxt.options.workspaceDir].filter(Boolean))]

  for (const dir of dirs) {
    const pkg = await readPackageJson(pathe.join(dir, 'package.json'))
    const packageManager = pkg?.packageManager?.split('@')[0]

    if (
      packageManager === 'npm' ||
      packageManager === 'pnpm' ||
      packageManager === 'yarn' ||
      packageManager === 'bun'
    ) {
      return packageManager
    }
  }

  for (const dir of dirs) {
    if (await exists(pathe.join(dir, 'pnpm-lock.yaml'))) return 'pnpm'
    if (await exists(pathe.join(dir, 'yarn.lock'))) return 'yarn'
    if (await exists(pathe.join(dir, 'bun.lockb'))) return 'bun'
    if (await exists(pathe.join(dir, 'bun.lock'))) return 'bun'
    if (await exists(pathe.join(dir, 'package-lock.json'))) return 'npm'
  }

  return 'unknown'
}

async function resolveCrossWS(nuxt: Nuxt): Promise<ResolvedCrossWS | null> {
  const dirs = [
    nuxt.options.rootDir,
    nuxt.options.workspaceDir,
    ...(nuxt.options.modulesDir || []),
  ].filter(Boolean)

  const uniqueDirs = [...new Set(dirs)]

  // 1. Direct/hoisted project resolution.
  for (const dir of uniqueDirs) {
    const packageJsonPath = resolvePackageJsonFrom('crossws', dir)
    const version = packageJsonPath && await readPackageVersion(packageJsonPath)

    if (packageJsonPath && version) {
      return {
        version,
        packageJsonPath,
        via: 'project resolution',
      }
    }
  }

  // 2. Nitro owner resolution. This matters with pnpm's strict node_modules layout.
  for (const dir of uniqueDirs) {
    for (const owner of ['nitro', 'nitropack']) {
      const ownerPackageJsonPath = resolvePackageJsonFrom(owner, dir)
      if (!ownerPackageJsonPath) continue

      const packageJsonPath = resolvePackageJsonFromPackage(
        'crossws',
        ownerPackageJsonPath,
      )
      const version = packageJsonPath && await readPackageVersion(packageJsonPath)

      if (packageJsonPath && version) {
        return {
          version,
          packageJsonPath,
          via: owner,
        }
      }
    }
  }

  return null
}

function getOverrideSnippet(packageManager: PackageManager) {
  switch (packageManager) {
    case 'pnpm':
      return `{
  "pnpm": {
    "overrides": {
      "crossws": "^${MIN_CROSSWS_VERSION}"
    }
  }
}`

    case 'yarn':
      return `{
  "resolutions": {
    "crossws": "^${MIN_CROSSWS_VERSION}"
  }
}`

    case 'npm':
    case 'bun':
    case 'unknown':
    default:
      return `{
  "overrides": {
    "crossws": "^${MIN_CROSSWS_VERSION}"
  }
}`
  }
}

export async function checkCrossWSVersion(
  ctx: NuxtEasyWebSocketContext,
  nuxt: Nuxt,
) {
  const resolved = await resolveCrossWS(nuxt)
  const packageManager = await detectPackageManager(nuxt)

  if (!resolved) {
    ctx.logger.warn(
      [
        `${NUXT_EASY_WEBSOCKET_MODULE_ID}: Could not resolve crossws from this Nuxt project.`,
        `This module requires crossws >= ${MIN_CROSSWS_VERSION}.`,
        `Add an override to your root package.json, reinstall, and restart Nuxt:`,
        '',
        getOverrideSnippet(packageManager),
      ].join('\n'),
    )
    return
  }

  if (!isLowerVersion(resolved.version, MIN_CROSSWS_VERSION)) return

  ctx.logger.warn(
    [
      `${NUXT_EASY_WEBSOCKET_MODULE_ID}: detected crossws ${resolved.version} via ${resolved.via}.`,
      `This module requires crossws >= ${MIN_CROSSWS_VERSION}.`,
      `Resolved package: ${resolved.packageJsonPath}`,
      '',
      `Add this to your root package.json, reinstall, and restart Nuxt:`,
      '',
      getOverrideSnippet(packageManager),
    ].join('\n'),
  )
}
