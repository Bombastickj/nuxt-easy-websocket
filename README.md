# Nuxt EasyWebSocket

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A powerful Nuxt module providing seamless WebSocket integration with type-safe communication between client and server.

- [✨ Release Notes](/CHANGELOG.md)
- [🏀 Online playground](https://stackblitz.com/github/Bombastickj/nuxt-easy-websocket?file=playground%2Fapp.vue)

## Features

- 🔄 **Auto-reconnection** with configurable attempts and delay
- 🌐 **Multiple WebSocket connections** (default internal + external)
- 🔍 **Type-safe messaging** between client and server
- 🧩 **File-based routing** for WebSocket events
- 🔌 **Connection lifecycle hooks** (open, close)
- 🛠️ **Simple API** for sending and receiving messages
- 📦 **Binary event support** with named, file-routed binary messages
- 🧵 **Raw WebSocket passthrough** for third-party protocols and unframed binary messages
- 📝 **TypeScript support** with full type inference

## Installation

```bash
npx nuxi@latest module add nuxt-easy-websocket
```

## Setup

Add `nuxt-easy-websocket` to the `modules` section of your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-easy-websocket'],
})
```

## Configuration

Configure the module with these options in your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-easy-websocket'],
  easyWebSocket: {
    // Directory for client-side WebSocket event handlers (default: 'socket')
    clientSrcDir: 'socket',
    
    // Directory for server-side WebSocket event handlers (default: 'socket')
    serverSrcDir: 'socket',
    
    // Delimiter for route paths (default: '/')
    delimiter: '/',
    
    // WebSocket connection options
    ws: {
      // Maximum number of reconnection attempts (default: 10)
      maxReconnectAttempts: 10,
      
      // Delay between reconnection attempts in milliseconds (default: 5000)
      reconnectDelay: 5000,
      
      // Whether to automatically reconnect when connection closes (default: true)
      reconnectOnClose: true,
    },
    
    // External WebSocket connections (optional)
    externalSockets: {
      'example-socket': {
        url: 'wss://example.com/socket',
        // Override default connection options for this socket (optional)
        ws: {
          maxReconnectAttempts: 5,
          reconnectDelay: 3000,
        }
      }
    }
  }
})
```

## Usage

### Directory Structure

The module uses a file-based routing system similar to Nitro Routes:

```
📁 project/
├── 📁 app/
│   ├── 📁 socket/                  # Client-side WebSocket handlers
│   │   ├── 📄 _binary.ts           # Handle unframed binary messages from the default socket
│   │   ├── 📄 _text.ts             # Handle raw text messages from the default socket
│   │   ├── 📄 chat.ts              # Handle 'chat' events from server
│   │   └── 📄 notification.ts      # Handle 'notification' events from server
│   │
│   └── 📁 example-socket/          # External WebSocket handlers (folder name must match the socket name)
│       ├── 📄 _binary.ts           # Handle unframed binary messages from this external socket
│       ├── 📄 _text.ts             # Handle raw text messages from this external socket
│       └── 📄 pong.ts              # Handle 'pong' event from external socket
│
├── 📁 server/
│   ├── 📁 socket/                  # Server-side WebSocket handlers
│   │   ├── 📄 open.ts              # Connection opened event
│   │   ├── 📄 close.ts             # Connection closed event
│   │   └── 📁 api/                 # API endpoints for client-to-server communication
│   │       ├── 📄 _binary.ts       # Handle unframed binary messages from client
│   │       ├── 📄 _text.ts         # Handle raw text messages from client
│   │       ├── 📄 message.ts       # Handle 'message' events from client
│   │       └── 📁 user/            # API endpoints for client-to-server communication
│   │           └── 📄 login.ts     # Handle 'user/login' events from client
│   │
└── 📄 nuxt.config.ts
```

> **Important**: For external WebSockets, the directory name must match the socket name defined in the configuration. For example, if you configured an external socket named `example-socket`, its event handlers should be placed in `app/example-socket/`.

### Client-Side

#### Defining Client-Side Event Handlers

Create a file in your `app/socket` directory (or the configured `clientSrcDir`):

```ts
// app/socket/chat.ts
export default defineEasyWSEvent<{
  message: string
  user: string
  timestamp: number
}>(({ data }) => {
  console.log(`New message from ${data.user}: ${data.message}`)
  // Handle the chat message from the server
})
```

#### Using WebSocket in Components

```vue
<script setup>
// Access the WebSocket instance
const ws = useEasyWS()

// Connection status
const status = ws.connectionStatus
const isConnected = computed(() => status.value === 'connected')

// Send a message to the server
function sendMessage() {
  ws.send('api/message', {
    text: 'Hello world!',
    userId: 123
  })
}

// External WebSocket (if configured)
// Only available if you've defined external sockets in your config
const externalWs = useExternalWS('example-socket')
function sendExternalMessage() {
  externalWs.send('ping', { timestamp: Date.now() })
}
</script>

<template>
  <div>
    <p>Connection status: {{ status }}</p>
    <button @click="sendMessage" :disabled="!isConnected">
      Send Message
    </button>
    <button @click="ws.forceReconnect">
      Reconnect
    </button>
  </div>
</template>
```

### Server-Side

#### Defining Connection Handlers

```ts
// server/socket/open.ts
export default defineEasyWSConnection(({ peer }) => {
  console.log(`New client connected: ${peer.peer.id}`)
  
  // Subscribe client to topics
  peer.subscribe('announcements')
})

// server/socket/close.ts
export default defineEasyWSConnection(({ peer }) => {
  console.log(`Client disconnected: ${peer.peer.id}`)
})
```

#### Defining Server-Side Event Handlers

```ts
// server/socket/api/message.ts
export default defineEasyWSEvent<{
  text: string
  userId: number
}>(async ({ data, peer }) => {
  console.log(`Received message from user ${data.userId}: ${data.text}`)
  
  // Send a response back to the client
  await peer.send('chat', {
    message: `Echo: ${data.text}`,
    user: 'Server',
    timestamp: Date.now()
  })
  
  // Send to all subscribed clients
  await peer.publish('announcements', {
    message: `User ${data.userId} sent a message`,
    timestamp: Date.now()
  })
})
```

#### Broadcasting to Connected Clients

```ts
// server/api/broadcast.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Broadcast to all connected clients
  for (const peer of EasyWSConnections.values()) {
    await peer.send('notification', {
      title: 'Broadcast',
      message: body.message,
      timestamp: Date.now()
    })
  }
  
  return { success: true }
})
```

### Using External WebSockets

If you've configured external WebSocket connections, you can handle EasyWebSocket-style events from them:

**File: `app/example-socket/pong.ts`**

```ts
export default defineEasyWSEvent<{
  timestamp: number
}>(({ data }) => {
  const diffInMs = Date.now() - data.timestamp
  console.log(`Pong took: ${diffInMs}ms`)
})
```

For third-party WebSockets that do not use the EasyWebSocket message envelope or binary frame format, use `sendRaw()` to send exact text or binary data.

**File: `app/components/ExternalSocketExample.vue`**

```vue
<script setup lang="ts">
const externalWs = useExternalWS('example-socket')

await externalWs.sendRaw(new Uint8Array([1, 2, 3]))
await externalWs.sendRaw('SUBSCRIBE ticker:BTC')
</script>
```

Raw text messages and unframed binary messages received from an external socket are routed to reserved handlers inside the matching external socket directory: `_text` receives `string` payloads, and `_binary` receives `Uint8Array` payloads.

**File: `app/example-socket/_text.ts`**

```ts
export default defineEasyWSEvent<string>(({ data }) => {
  console.log('Received raw external text packet:', data)
})
```

**File: `app/example-socket/_binary.ts`**

```ts
export default defineEasyWSEvent<Uint8Array>(({ data }) => {
  console.log('Received raw external binary packet:', data)
})
```

### Type Augmentation for External WebSockets

To get type safety with external WebSockets, augment the module types by creating a declaration file:

```ts
// project/types/external-ws.d.ts
declare module '#nuxt-easy-websocket/routes' {
  interface EasyWSExternalRoutes {
    'example-socket': {
      ping: { timestamp: number }
    }
  }
}
```

This provides type safety when using `useExternalWS` composable:

```ts
// Type-safe usage with the augmented types
const externalWs = useExternalWS('example-socket')
externalWs.send('ping', { timestamp: Date.now() }) // Fully typed!
```

### Binary Messages and Raw WebSocket Data

`nuxt-easy-websocket` supports routed EasyWebSocket messages and raw WebSocket passthrough:

| API | Use case | Routing behavior |
| --- | --- | --- |
| `send(name, data)` with JSON-compatible data | EasyWebSocket text events | Sends the standard JSON envelope `{ name, data }` and routes by event name. |
| `send(name, data)` with binary data | EasyWebSocket binary events | Adds the EasyWebSocket binary frame and routes by event name. |
| `sendRaw(data)` | Third-party protocols or byte-exact messages | Sends the data exactly as provided. No event name, JSON envelope, or magic header is added. Incoming raw text is routed to `_text`; incoming unframed binary is routed to `_binary`. |

EasyWebSocket-routed binary messages use the same file-based event names as JSON messages. The binary frame stores the encoded event-name length as a 32-bit unsigned integer, so deeply nested routes and long custom delimiters are supported.

Use `send()` when both sides use `nuxt-easy-websocket`. Use `sendRaw()` when the other side expects a custom protocol, such as a third-party WebSocket server, or when you intentionally want to send a raw text or binary WebSocket message.

#### Sending Routed Binary Events

When `send()` receives an `ArrayBuffer`, `ArrayBufferView` such as `Uint8Array`, or `Blob`, the payload is wrapped in an EasyWebSocket binary frame. This keeps binary messages compatible with named events and file-based routing.

**File: `app/components/BinaryUpload.vue`**

```vue
<script setup lang="ts">
const ws = useEasyWS()

const bytes = new Uint8Array([1, 2, 3])
await ws.send('api/process-binary', bytes)
</script>
```

**File: `server/socket/api/process-binary.ts`**

```ts
export default defineEasyWSEvent<Uint8Array>(({ data, peer }) => {
  // Binary EasyWebSocket payloads are delivered as Uint8Array.
  console.log('Received routed binary event:', data)

  peer.send('binary-response', new Uint8Array([4, 5, 6]))
})
```

**File: `app/socket/binary-response.ts`**

```ts
export default defineEasyWSEvent<Uint8Array>(({ data }) => {
  console.log('Received routed binary response:', data)
})
```

#### Sending Raw WebSocket Data

Use `sendRaw()` when you do not want the EasyWebSocket frame or JSON envelope. This is useful for external sockets, custom text protocols, and custom binary protocols.

**File: `app/components/RawSocketMessage.vue`**

```vue
<script setup lang="ts">
const ws = useEasyWS()

await ws.sendRaw(new Uint8Array([1, 2, 3]))
await ws.sendRaw('raw text message')
</script>
```

On the server, `EasyWSPeer` also exposes raw send helpers.

**File: `server/socket/api/send-raw.ts`**

```ts
export default defineEasyWSEvent<undefined>(async ({ peer }) => {
  await peer.sendRaw(new Uint8Array([4, 5, 6]))
  await peer.sendRaw('raw text message')
})
```

#### Receiving Raw Text and Unframed Binary Data

Incoming raw text messages are routed to a reserved `_text` event. Incoming binary messages that do not contain the EasyWebSocket magic header are routed to a reserved `_binary` event.

**File: `server/socket/api/_text.ts`**

```ts
export default defineEasyWSEvent<string>(({ data, peer }) => {
  console.log('Received raw text from client:', data)

  peer.sendRaw(`echo: ${data}`)
})
```

**File: `server/socket/api/_binary.ts`**

```ts
export default defineEasyWSEvent<Uint8Array>(({ data, peer }) => {
  console.log('Received raw binary from client:', data)
})
```

**File: `app/socket/_text.ts`**

```ts
export default defineEasyWSEvent<string>(({ data }) => {
  console.log('Received raw text from server:', data)
})
```

**File: `app/socket/_binary.ts`**

```ts
export default defineEasyWSEvent<Uint8Array>(({ data }) => {
  console.log('Received raw binary from server:', data)
})
```

For external WebSockets, place the `_text` and `_binary` handlers in the external socket directory.

**File: `app/example-socket/_text.ts`**

```ts
export default defineEasyWSEvent<string>(({ data }) => {
  console.log('Received raw text from example-socket:', data)
})
```

**File: `app/example-socket/_binary.ts`**

```ts
export default defineEasyWSEvent<Uint8Array>(({ data }) => {
  console.log('Received raw binary from example-socket:', data)
})
```

> **How it works**: EasyWebSocket binary messages use a lightweight frame: `[0xE7][0x57][4 bytes: NameLength][Name][RawData]`. The `NameLength` field is an unsigned 32-bit integer encoded in network byte order, so binary event names support deeply nested routes and long custom delimiters. If incoming binary data does not start with the EasyWebSocket magic bytes, it is treated as unframed binary and routed to `_binary`. Raw text messages that are not valid EasyWebSocket JSON envelopes are routed to `_text`. Text-based EasyWebSocket messages continue to use the standard JSON envelope: `{ name, data }`. Raw text/binary classification depends on the original raw message value exposed by the WebSocket runtime through CrossWS; conversion helpers such as `message.text()` or `message.uint8Array()` should not be used to decide the original frame type.

## TypeScript Support

The module provides full TypeScript support with type inference for your WebSocket events. The types are automatically generated based on your file structure.

## Advanced Usage

### Accessing Connection State

```vue
<script setup>
const ws = useEasyWS()

// Read-only state object
const state = ws.state

// Computed helpers
const isConnected = computed(() => ws.connectionStatus.value === 'connected')
const maxAttemptsReached = ws.maxReconnectAttemptsReached
</script>

<template>
  <div>
    <p>Status: {{ ws.connectionStatus }}</p>
    <p v-if="state.lastError">Last error: {{ state.lastError }}</p>
    <p v-if="state.reconnectCountdown">
      Reconnecting in {{ state.reconnectCountdown }}s...
    </p>
    <p v-if="maxAttemptsReached">
      Max reconnection attempts reached
    </p>
  </div>
</template>
```

### Server-Side Topic Subscriptions

WebSocket clients can subscribe to topics for pub/sub functionality:

```ts
// server/socket/api/subscribe.ts
export default defineEasyWSEvent<{
  topic: string
}>(async ({ data, peer }) => {
  // Subscribe client to the requested topic
  await peer.subscribe(data.topic)
  
  // Confirm subscription
  await peer.send('notification', {
    title: 'Subscribed',
    message: `You are now subscribed to ${data.topic}`,
    timestamp: Date.now()
  })
})
```

## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
  
  # Run Vitest
  npm run test
  npm run test:watch
  
  # Release new version
  npm run release
  ```

</details>

## License

[MIT License](./LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-easy-websocket/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-easy-websocket

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-easy-websocket.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/nuxt-easy-websocket

[license-src]: https://img.shields.io/npm/l/nuxt-easy-websocket.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-easy-websocket

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
