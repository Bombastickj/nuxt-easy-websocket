<template>
  <div>
    Nuxt module playground!
  </div>
</template>

<script setup lang="ts">
onMounted(() => {
  useEasyWS().send('ping', { timestamp: Date.now() })
  // useNuxtApp().$easyWS.send('chat/send', {})
})
</script>
