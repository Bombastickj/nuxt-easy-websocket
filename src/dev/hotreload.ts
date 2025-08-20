import pathe from 'pathe'
import { updateTemplates } from '@nuxt/kit'
import { MODULE_TMP_PATH, SERVER_CONN_BASENAME_RE } from '../constants'
import { buildRoute, stripExt } from '../utils/fileScanner'

import type { Nuxt } from 'nuxt/schema'
import type { NuxtEasyWebSocketContext, RouteMap } from '../types'

type Kind =
  | { kind: 'client'; ns: string; baseDir: string }
  | { kind: 'serverRoute'; baseDir: string }
  | { kind: 'serverConn'; baseDir: string }
  | { kind: 'unknown' }

function classify(ctx: NuxtEasyWebSocketContext, absPath: string): Kind {
  const p = pathe.normalize(absPath)

  for (const L of ctx.layers) {
    // server connection files (open/close/error at top-level of serverDir)
    if (p.startsWith(L.serverDir + pathe.sep)) {
      const rel = pathe.relative(L.serverDir, p)
      const isTop = !rel.includes(pathe.sep)
      if (isTop && SERVER_CONN_BASENAME_RE.test(rel)) {
        return { kind: 'serverConn', baseDir: L.serverDir }
      }
    }
    // server routes (server/api/**)
    if (p.startsWith(L.serverApiDir + pathe.sep)) {
      return { kind: 'serverRoute', baseDir: L.serverApiDir }
    }
    // default client
    if (p.startsWith(L.clientDir + pathe.sep)) {
      return { kind: 'client', ns: 'default', baseDir: L.clientDir }
    }
    // external client namespaces
    for (const [ns, dir] of Object.entries(L.externalClientDirs)) {
      if (p.startsWith(dir + pathe.sep)) {
        return { kind: 'client', ns, baseDir: dir }
      }
    }
  }
  return { kind: 'unknown' }
}

async function updateOnly(which: 'client' | 'serverRoute' | 'serverConn') {
  let filterArr: string[] = []

  switch (which) {
    case 'client':
      filterArr = [MODULE_TMP_PATH.routes, MODULE_TMP_PATH.clientEvents]
      break

    case 'serverRoute':
      filterArr = [MODULE_TMP_PATH.routes, MODULE_TMP_PATH.serverEvents]
      break
    case 'serverConn':
      filterArr = [MODULE_TMP_PATH.serverEvents]
      break
  }

  await updateTemplates({
    filter: (t) => filterArr.includes(t.filename),
  })
}

export function setupHMR(ctx: NuxtEasyWebSocketContext, nuxt: Nuxt) {
  if (!nuxt.options.dev) return

  nuxt.hook('vite:serverCreated', (vite, env) => {
    // One watcher is enough; use the SSR side to watch project files
    if (env.isClient) return

    // Watch server paths / app is already watched
    vite.watcher.add(ctx.layers.map((l) => l.serverDir))

    const onChange = async (
      event: 'unlink' | 'add' | 'change',
      pathAbs: string,
    ) => {
      if (!/\.(ts|js)$/i.test(pathAbs)) return

      const classified = classify(ctx, pathAbs)
      if (classified.kind === 'unknown') return

      const filePath = stripExt(pathAbs)

      try {
        if (event === 'unlink') {
          if (classified.kind === 'client') {
            const nsMap = ctx.clientRoutes.get(classified.ns) || new Map()
            nsMap.delete(filePath)
            ctx.clientRoutes.set(classified.ns, nsMap)

            await updateOnly('client')
          } else if (classified.kind === 'serverRoute') {
            ctx.serverRoutes.delete(filePath)

            await updateOnly('serverRoute')
          } else if (classified.kind === 'serverConn') {
            ctx.serverConnection.delete(filePath)

            await updateOnly('serverConn')
          }
          return
        }

        if (event === 'add' || event === 'change') {
          // Rebuild a single route descriptor
          const route = await buildRoute(ctx, pathAbs, classified.baseDir)

          if (classified.kind === 'client') {
            const nsMap: RouteMap =
              ctx.clientRoutes.get(classified.ns) || new Map()

            if (!route) nsMap.delete(filePath)
            else nsMap.set(filePath, route)

            ctx.clientRoutes.set(classified.ns, nsMap)

            updateOnly('client')
          } else if (classified.kind === 'serverRoute') {
            if (!route) ctx.serverRoutes.delete(filePath)
            else ctx.serverRoutes.set(filePath, route)

            updateOnly('serverRoute')
          } else if (classified.kind === 'serverConn') {
            if (!route) ctx.serverConnection.delete(filePath)
            else ctx.serverConnection.set(filePath, route)

            updateOnly('serverConn')
          }
        }
      } catch (err) {
        ctx.logger.warn(
          `[HMR] Failed to process ${event} for ${pathAbs}: ${(err as Error).message}`,
        )
      }
    }

    // this is called on client & our watched server files
    vite.watcher.on('all', (event, path) => {
      path = ctx.resolver.resolve(path)

      if (event === 'add' || event === 'change' || event === 'unlink') {
        onChange(event, path)
      }
    })
  })
}
