<template>
  <div>{{ connectionStatus }}</div>
</template>

<script setup>
const { connectionStatus } = useEasyWS()
</script>
