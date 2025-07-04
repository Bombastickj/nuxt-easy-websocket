import type { NuxtApp } from '#app'
import { useNuxtApp } from '#app'

export const useEasyWS = (): NuxtApp['$easyWS'] => useNuxtApp().$easyWS
