import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  easyWebSocket: {
    ws: {
      autoConnect: false
    }
  }
})
