<template>
  <div>
    <div id="status">{{ connectionStatus }}</div>
    <div id="welcome">{{ welcomeMsg }}</div>
    <div id="pong">{{ pongMsg }}</div>
    <div id="external">{{ externalMsg }}</div>
    <div id="binary-echo">{{ binaryEchoMsg }}</div>
    <div id="raw-text">{{ rawTextMsg }}</div>
    <div id="raw-binary">{{ rawBinaryMsg }}</div>

    <button id="ping-btn" @click="sendPing">Send Ping</button>
    <button id="ext-btn" @click="testExternal">Test External</button>

    <button id="raw-text-btn" @click="sendRawText">
      Send Raw Text
    </button>

    <button id="raw-binary-btn" @click="sendRawBinary">
      Send Raw Binary
    </button>

    <button id="binary-arraybuffer-btn" @click="sendBinary('arraybuffer')">
      Send ArrayBuffer
    </button>

    <button id="binary-uint8array-btn" @click="sendBinary('uint8array')">
      Send Uint8Array
    </button>

    <button id="binary-dataview-btn" @click="sendBinary('dataview')">
      Send DataView
    </button>

    <button id="binary-blob-btn" @click="sendBinary('blob')">
      Send Blob
    </button>

    <button id="binary-int32-btn" @click="sendBinary('int32')">
      Send Int32Array
    </button>
  </div>
</template>

<script setup lang="ts">
const { connectionStatus, send, sendRaw } = useEasyWS()
const extWS = useExternalWS('external-test')

const welcomeMsg = useState('welcome', () => '')
const pongMsg = useState('pong', () => '')
const externalMsg = useState('external', () => '')
const binaryEchoMsg = useState('binary-echo', () => '')
const rawTextMsg = useState('raw-text', () => '')
const rawBinaryMsg = useState('raw-binary', () => '')

function sendPing() {
  send('ping', { msg: 'browser-test' })
}

function sendRawText() {
  sendRaw('hello')
}

function sendRawBinary() {
  sendRaw(new Uint8Array([100, 101, 102]))
}

function testExternal() {
  extWS.setURL(location.origin.replace('http', 'ws') + '/_ws')
  extWS.connect()
  extWS.send('ping', { msg: 'external-test' })
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return copy.buffer
}

async function sendBinary(
  kind: 'arraybuffer' | 'uint8array' | 'dataview' | 'blob' | 'int32',
) {
  binaryEchoMsg.value = ''

  switch (kind) {
    case 'arraybuffer':
      await send('binary-echo', toArrayBuffer(new Uint8Array([1, 2, 3, 4, 5])))
      break

    case 'uint8array':
      await send('binary-echo', new Uint8Array([6, 7, 8, 9, 10]))
      break

    case 'dataview':
      await send('binary-echo', new DataView(toArrayBuffer(new Uint8Array([11, 12, 13, 14, 15]))))
      break

    case 'blob':
      await send('binary-echo', new Blob([toArrayBuffer(new Uint8Array([16, 17, 18, 19, 20]))]))
      break

    case 'int32':
      await send('binary-echo', new Int32Array([21, 22, 23, 24, 25]))
      break
  }
}
</script>
