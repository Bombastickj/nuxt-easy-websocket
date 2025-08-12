export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  typescript: {
    shim: false,
    typeCheck: true,
    strict: true,
  },
  easyWebSocket: {
    externalSockets: {
      'external-socket-example': {
        url: 'google.com',
        ws: {
          autoConnect: false,
        },
      },
    },
  },
})
