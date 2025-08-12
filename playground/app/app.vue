<template>
  <div>
    Nuxt module playground!
    <button @click="sendPing">
      Ping!
    </button>
    <button @click="disconnect()">
      Disconnect
    </button>

    <EasyWSTimeout />
  </div>
</template>

<script setup lang="ts">
const { send, disconnect } = useEasyWS()

function sendPing() {
  send('ping', { timestamp: Date.now() })
  send('types-test-0')
}
onMounted(() => {
  sendPing()
  // useNuxtApp().$easyWS.send('chat/send', {})
  // useExternalWS('external-socket-example').send('example-ping')
})
</script>
