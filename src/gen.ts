import defu from 'defu'
import { genExport } from 'knitwork'
import { addTemplate } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { NuxtEasyWebSocketContext } from './context'

export function generateClientEvents(
  { resolver, clientEvents }: NuxtEasyWebSocketContext,
  nuxt: Nuxt,
) {
  // Generate TypeScript interfaces based on scanned events
  const typeImportPath = resolver.resolve('runtime/shared-types')
  const generatedTemplate = `
/**
* This file is auto-generated by nuxt-easy-websocket module.
* Do not edit this file manually.
*/
import type { EasyWSClientEventGenerated } from '${typeImportPath}';

${clientEvents.map(event => event.imports).join('\n')}

export interface EasyWSServerToClientEvents {
  ${clientEvents.map(event => `'${event.name}': Parameters<typeof ${event.exports}>[0]['data'];`).join('\n  ')}
};

export const clientEvents: EasyWSClientEventGenerated<any>[] = [
  ${clientEvents.map(event => `{ name: '${event.name}', handler: ${event.exports} }`).join(',\n  ')}
];
`

  // Add the generated types to the Nuxt build
  const { dst } = addTemplate({
    filename: 'modules/easy-websocket-client.ts',
    getContents: () => generatedTemplate,
    write: true,
  })

  // Make the generated template available to the server handler
  nuxt.options.alias['#easy-websocket-client'] = dst

  nuxt.hook('prepare:types', async ({ tsConfig }) => {
    tsConfig.compilerOptions ||= {}
    tsConfig.compilerOptions.paths['#easy-websocket-client'] = [dst]
  })
  nuxt.hook('nitro:config', (config) => {
    config.typescript = defu(config.typescript, {
      tsConfig: {
        compilerOptions: {
          paths: {
            ['#easy-websocket-client']: [dst],
          },
        },
      },
    })

    if (config.imports === false) return

    config.virtual ||= {}
    config.virtual['#easy-websocket-client'] = genExport(dst, ['clientEvents'])
  })
}

export function generateServerEvents(
  { resolver, serverEvents, serverConnection }: NuxtEasyWebSocketContext,
  nuxt: Nuxt,
) {
  // Generate TypeScript interfaces based on scanned events
  const typeImportPath = resolver.resolve('runtime/shared-types')
  const generatedTemplate = `
/**
 * This file is auto-generated by nuxt-easy-websocket module.
 * Do not edit this file manually.
 */
import type { EasyWSServerConnectionGenerated, EasyWSServerEventGenerated } from '${typeImportPath}';

${serverEvents.map(event => event.imports).join('\n')}

${serverConnection.map(event => event.imports).join('\n')}

export interface EasyWSClientToServerEvents {
  ${serverEvents.map(event => `'${event.name}': Parameters<typeof ${event.exports}>[0]['data'];`).join('\n  ')}
};

export const serverEvents: EasyWSServerEventGenerated<any>[] = [
  ${serverEvents.map(event => `{ name: '${event.name}', handler: ${event.exports} }`).join(',\n  ')}
];

export const serverConnection: EasyWSServerConnectionGenerated[] = [
  ${serverConnection.map(event => event.exports).join(',\n  ')}
]
`

  // Add the template to Nuxt build
  const { dst } = addTemplate({
    filename: 'modules/easy-websocket-server.ts',
    getContents: () => generatedTemplate,
    write: true,
  })

  // Make the generated template available to the server handler
  nuxt.options.alias['#easy-websocket-server'] = dst

  nuxt.hook('prepare:types', async ({ tsConfig }) => {
    tsConfig.compilerOptions ||= {}
    tsConfig.compilerOptions.paths['#easy-websocket-server'] = [dst]
  })
  nuxt.hook('nitro:config', (config) => {
    config.typescript = defu(config.typescript, {
      tsConfig: {
        compilerOptions: {
          paths: {
            ['#easy-websocket-server']: [dst],
          },
        },
      },
    })

    if (config.imports === false) return

    config.virtual ||= {}
    config.virtual['#easy-websocket-server'] = genExport(dst, ['serverEvents', 'serverConnection'])
  })
}
