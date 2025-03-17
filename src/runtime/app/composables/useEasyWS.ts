import { useNuxtApp, type NuxtApp } from '#app'

export const useEasyWS = (): NuxtApp['$easyWS'] => useNuxtApp().$easyWS
