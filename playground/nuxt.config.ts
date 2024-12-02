export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  compatibilityDate: '2024-11-27',
  typescript: {
    shim: false,
    typeCheck: true,
    strict: true,
  },
  easyWebSocket: {},
})
