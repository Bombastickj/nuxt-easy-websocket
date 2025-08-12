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
├── 📁 server/
│   ├── 📁 socket/                  # Server-side WebSocket handlers
│   │   ├── 📄 open.ts              # Connection opened event
│   │   ├── 📄 close.ts             # Connection closed event
│   │   └── 📁 api/                 # API endpoints for client-to-server communication
│   │       ├── 📄 message.ts       # Handle 'message' events from client
│   │       └── 📁 user/            # API endpoints for client-to-server communication
│   │           └── 📄 login.ts     # Handle 'user/login' events from client
│   │
├── 📁 socket/                      # Client-side WebSocket handlers
│   ├── 📄 chat.ts                  # Handle 'chat' events from server
│   └── 📄 notification.ts          # Handle 'notification' events from server
│
├── 📁 example-socket/              # External WebSocket handlers (folder name must match the socket name)
│   └── 📄 pong.ts                 # Handle 'pong' event from external socket
```

> **Important**: For external WebSockets, the directory name must match the socket name defined in the configuration. For example, if you configured an external socket named `example-socket`, its event handlers should be placed in a directory named `example-socket/`.

### Client-Side

#### Defining Client-Side Event Handlers

Create a file in your `socket` directory (or the configured `clientSrcDir`):

```ts
// socket/chat.ts
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

If you've configured external WebSocket connections, you can handle events from them:

```ts
// example-socket/pong.ts (folder name must match the socket name)
export default defineEasyWSEvent<{
  timestamp: number
}>(({ data }) => {
  const diffInMs = Date.now() - data.timestamp
  console.log(`Pong took: ${diffInMs}ms`)
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
