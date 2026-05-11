<template>
  <div>
    <div id="status">{{ connectionStatus }}</div>
    <div id="welcome">{{ welcomeMsg }}</div>
    <div id="pong">{{ pongMsg }}</div>
    <div id="external">{{ externalMsg }}</div>
    
    <button id="ping-btn" @click="sendPing">Send Ping</button>
    <button id="ext-btn" @click="testExternal">Test External</button>
  </div>
</template>

<script setup lang="ts">
const { connectionStatus, send } = useEasyWS()
const extWS = useExternalWS('external-test')
const welcomeMsg = useState('welcome', () => '')
const pongMsg = useState('pong', () => '')
const externalMsg = useState('external', () => '')

function sendPing() {
  send('ping', { msg: 'browser-test' })
}

function testExternal() {
  // Set URL to internal one for testing loopback
  extWS.setURL(location.origin.replace('http', 'ws') + '/_ws')
  extWS.connect()
  extWS.send('ping', { msg: 'external-test' })
}
</script>
