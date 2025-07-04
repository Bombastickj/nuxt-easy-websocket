import type { NuxtApp } from '#app'
import { useNuxtApp } from '#app'

export function useExternalWS<T extends keyof NuxtApp['$easyWS']['external']>(name: T): NuxtApp['$easyWS']['external'][T] {
  const nuxtApp = useNuxtApp()
  return nuxtApp.$easyWS.external[name]!
}
