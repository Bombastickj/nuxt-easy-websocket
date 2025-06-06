import { useNuxtApp, type NuxtApp } from '#app'
import type { EasyWSExternalRoutes } from '#nuxt-easy-websocket/routes'

export function useExternalWS<T extends keyof EasyWSExternalRoutes>(name: T): NuxtApp['$easyWS']['external'][T] {
  const nuxtApp = useNuxtApp()
  return nuxtApp.$easyWS.external[name]!
}
