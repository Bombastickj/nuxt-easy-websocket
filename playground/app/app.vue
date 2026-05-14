<template>
  <div>
    Nuxt module playground!
    <button @click="sendPing">
      Ping!
    </button>
    <button @click="sendRawText">
      Send raw text
    </button>
    <button @click="sendRawBinary">
      Send raw binary
    </button>
    <button @click="disconnect()">
      Disconnect
    </button>

    <EasyWSTimeout />
  </div>
</template>

<script setup lang="ts">
const { send, sendRaw, disconnect } = useEasyWS()

function sendPing() {
  send('ping', { timestamp: Date.now() })
  send('types-test-0')
}

function sendRawText() {
  sendRaw('hello')
}

function sendRawBinary() {
  sendRaw(new Uint8Array([100, 101, 102]))
}

onMounted(() => {
  sendPing()
  // useNuxtApp().$easyWS.send('chat/send', {})
  // useExternalWS('external-socket-example').send('example-ping')
})
</script>
