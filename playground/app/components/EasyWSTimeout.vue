<template>
  <div
    v-if="isOpen"
    class="easy-ws-timeout-wrapper"
  >
    <div class="card">
      <div
        v-if="state.reconnectCountdown"
        class="message"
      >
        <p>{{ state.lastError }}</p>
        <p>
          Connection lost. Reconnecting in {{ state.reconnectCountdown }} second<span v-if="state.reconnectCountdown !== 1">s</span>...
        </p>
      </div>
      <div
        v-else
        class="message"
      >
        <p>
          {{ maxReconnectAttemptsReached && isDisconnected ? 'Connection failed' : 'Reconnecting...' }}
        </p>
      </div>

      <button
        v-if="isDisconnected"
        @click="forceReconnect"
      >
        Reconnect Now
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { state, connectionStatus, maxReconnectAttemptsReached, forceReconnect } = useEasyWS()
const isDisconnected = computed(() => connectionStatus.value === 'disconnected')
const isOpen = computed(() => connectionStatus.value === 'connecting' || isDisconnected.value)
</script>

<style>
.easy-ws-timeout-wrapper {
  position: fixed;
  inset: 0;

  display: grid;
  justify-items: center;
  align-items: center;
}
.easy-ws-timeout-wrapper .card {
  width: min(100%, 400px);
  background-color: lightgray;

  padding: 10px;
}
</style>
