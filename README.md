# Nuxt EasyWebSocket

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

This Nuxt module is aimed for a seamless integration of the native WebSocket.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
- [🏀 Online playground](https://stackblitz.com/github/Bombastickj/nuxt-easy-websocket?file=playground%2Fapp.vue)
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Installation

```bash
npx nuxi@latest module add nuxt-easy-websocket
```


## Configuration

In your Nuxt project, configure the module options inside `nuxt.config.js`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-easy-websocket'],
  easyWebSocket: {
    serverSrcDir: 'my-socket-folder', // optional: defaults to 'socket' if not specified
    clientSrcDir: 'my-socket-folder', // optional: defaults to 'socket' if not specified
  }
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


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-easy-websocket/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-easy-websocket

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-easy-websocket.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/nuxt-easy-websocket

[license-src]: https://img.shields.io/npm/l/nuxt-easy-websocket.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-easy-websocket

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
