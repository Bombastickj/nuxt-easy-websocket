<template>
  <div>
    Nuxt module playground!
    <button @click="sendPing">
      Ping!
    </button>
    <button @click="disconnect">
      Disconnect
    </button>

    <EasyWSTimeout />
  </div>
</template>

<script setup lang="ts">
const { send, disconnect } = useEasyWS()

function sendPing() {
  send('ping', { timestamp: Date.now() })
}
onMounted(() => {
  sendPing()
  // useNuxtApp().$easyWS.send('chat/send', {})
})
</script>
