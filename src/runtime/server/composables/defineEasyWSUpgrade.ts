import type { EasyWSServerUpgradeHandler } from '../../shared-types'

/**
 * Define a WebSocket upgrade handler that runs before the connection is established.
 *
 * Use this to validate the upgrade request, perform authentication/authorization,
 * check the `Origin` header, or reject connections before a socket is opened.
 *
 * The handler receives the raw `Request` object from the upgrade and can:
 * - **Reject** the connection by throwing a `Response` (e.g. `throw new Response(null, { status: 403 })`)
 * - **Allow** the connection by returning nothing (`undefined`)
 * - **Modify the response** by returning `{ headers }` (custom response headers)
 * - **Set a peer context** by returning `{ context }` (available via `peer.context`)
 *
 * @example
 * ```ts
 * // server/socket/upgrade.ts
 * export default defineEasyWSUpgrade(async (request) => {
 *   const origin = request.headers.get('origin')
 *   if (origin !== 'https://myapp.com') {
 *     throw new Response(null, { status: 403, statusText: 'Forbidden' })
 *   }
 *
 *   // Optionally attach user info to peer context
 *   const user = await validateSession(request)
 *   return { context: { user } }
 * })
 * ```
 */
export function defineEasyWSUpgrade(
  handler: EasyWSServerUpgradeHandler,
): EasyWSServerUpgradeHandler {
  return handler
}
