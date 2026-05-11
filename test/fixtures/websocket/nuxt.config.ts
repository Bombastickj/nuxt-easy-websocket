import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  easyWebSocket: {
    ws: {
      heartbeat: {
        timeoutMs: 1000
      }
    },
    externalSockets: {
      'external-test': {
        url: null, // We will set it dynamically in the test or keep it null if we just want to test the composable
        ws: {
          autoConnect: false
        }
      }
    }
  }
})
