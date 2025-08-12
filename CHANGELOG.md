# Changelog


## v4.0.0-alpha.1

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v4.0.0-alpha...v4.0.0-alpha.1)

### 🩹 Fixes

- **types:** Added generics to improve send function typing ([ca81898](https://github.com/Bombastickj/nuxt-easy-websocket/commit/ca81898))

### 🏡 Chore

- Bump alpha version ([fd30696](https://github.com/Bombastickj/nuxt-easy-websocket/commit/fd30696))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v4.0.0-alpha

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v3.5.1...v4.0.0-alpha)

### 🚀 Enhancements

- **ast-walking:** Add `ts-morph` & simple ast handling for type extraction ([f1cd23e](https://github.com/Bombastickj/nuxt-easy-websocket/commit/f1cd23e))
- **typing:** Incooperate improved type resolving via ts-morph ([476cf2a](https://github.com/Bombastickj/nuxt-easy-websocket/commit/476cf2a))
- **playground:** Added more test cases for correct type resolving ([d3e6e88](https://github.com/Bombastickj/nuxt-easy-websocket/commit/d3e6e88))

### 💅 Refactors

- **module:** Improved code structure ([dbd16b7](https://github.com/Bombastickj/nuxt-easy-websocket/commit/dbd16b7))
- **module:** Improved code structure ([a431026](https://github.com/Bombastickj/nuxt-easy-websocket/commit/a431026))
- **server-composables:** ⚠️  `defineEasyWSSConnection` is now `defineEasyWSConnection` ([3d9718d](https://github.com/Bombastickj/nuxt-easy-websocket/commit/3d9718d))
- **server-composables:** ⚠️  `defineEasyWSSEvent` is now `defineEasyWSEvent` ([3a78361](https://github.com/Bombastickj/nuxt-easy-websocket/commit/3a78361))
- **server-utils:** ⚠️  `EasyWSSConnections` is now `EasyWSConnections` ([0b1b9eb](https://github.com/Bombastickj/nuxt-easy-websocket/commit/0b1b9eb))
- **server-utils:** ⚠️  `EasyWSServerPeer` is now `EasyWSPeer` ([b8198e6](https://github.com/Bombastickj/nuxt-easy-websocket/commit/b8198e6))
- **server-plugins:** `easyWSSHeartbeat` is now `easyWSHeartbeat` ([82301e0](https://github.com/Bombastickj/nuxt-easy-websocket/commit/82301e0))
- **server-utils:** Fix types ([a26dc93](https://github.com/Bombastickj/nuxt-easy-websocket/commit/a26dc93))
- **template-gen:** Moved `generateClientEvents` to seperate file ([0e17d19](https://github.com/Bombastickj/nuxt-easy-websocket/commit/0e17d19))
- **template-gen:** Moved `generateServerEvents` to seperate file ([3325610](https://github.com/Bombastickj/nuxt-easy-websocket/commit/3325610))
- **template-gen:** Moved `generatePluginTypes` to seperate file ([91db0de](https://github.com/Bombastickj/nuxt-easy-websocket/commit/91db0de))
- **template-gen:** Moved `generateRouteTypes` to seperate file ([59808b1](https://github.com/Bombastickj/nuxt-easy-websocket/commit/59808b1))
- Module code cleanup ([691175b](https://github.com/Bombastickj/nuxt-easy-websocket/commit/691175b))
- **ts-expect-error:** IDE & VueTSC disagree with availability of imports ([54d33ae](https://github.com/Bombastickj/nuxt-easy-websocket/commit/54d33ae))

### 🏡 Chore

- **nuxt:** ⚠️  Upgraded to Nuxt v4 ([4b639c4](https://github.com/Bombastickj/nuxt-easy-websocket/commit/4b639c4))
- Refactor module & types ([3ec1b23](https://github.com/Bombastickj/nuxt-easy-websocket/commit/3ec1b23))
- Refactor shared-types & template output dir ([5800cf5](https://github.com/Bombastickj/nuxt-easy-websocket/commit/5800cf5))

#### ⚠️ Breaking Changes

- **server-composables:** ⚠️  `defineEasyWSSConnection` is now `defineEasyWSConnection` ([3d9718d](https://github.com/Bombastickj/nuxt-easy-websocket/commit/3d9718d))
- **server-composables:** ⚠️  `defineEasyWSSEvent` is now `defineEasyWSEvent` ([3a78361](https://github.com/Bombastickj/nuxt-easy-websocket/commit/3a78361))
- **server-utils:** ⚠️  `EasyWSSConnections` is now `EasyWSConnections` ([0b1b9eb](https://github.com/Bombastickj/nuxt-easy-websocket/commit/0b1b9eb))
- **server-utils:** ⚠️  `EasyWSServerPeer` is now `EasyWSPeer` ([b8198e6](https://github.com/Bombastickj/nuxt-easy-websocket/commit/b8198e6))
- **nuxt:** ⚠️  Upgraded to Nuxt v4 ([4b639c4](https://github.com/Bombastickj/nuxt-easy-websocket/commit/4b639c4))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v3.5.1

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v3.5.0...v3.5.1)

### 🩹 Fixes

- **manual-dc:** No proper reset after disconnect ([88b5a8c](https://github.com/Bombastickj/nuxt-easy-websocket/commit/88b5a8c))

### 🏡 Chore

- Upgrade package versions ([3c96b88](https://github.com/Bombastickj/nuxt-easy-websocket/commit/3c96b88))
- **lint:** Improved incorrect type imports ([da56eb7](https://github.com/Bombastickj/nuxt-easy-websocket/commit/da56eb7))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v3.5.0

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v3.4.0...v3.5.0)

### 🚀 Enhancements

- **external-sockets:** Add dynamic URL setting for WebSocket creation ([abb9b9f](https://github.com/Bombastickj/nuxt-easy-websocket/commit/abb9b9f))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v3.4.0

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v3.3.4...v3.4.0)

### 🚀 Enhancements

- Changed disconnect function to include optional `keepClosed` param ([7c219cd](https://github.com/Bombastickj/nuxt-easy-websocket/commit/7c219cd))

### 🩹 Fixes

- **client-socket:** Always await send if connection is not open ([5c93e8c](https://github.com/Bombastickj/nuxt-easy-websocket/commit/5c93e8c))
- **playground:** Correct syntax for disconnect button call ([57d6bd2](https://github.com/Bombastickj/nuxt-easy-websocket/commit/57d6bd2))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v3.3.4

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v3.3.3...v3.3.4)

### 🩹 Fixes

- **type-gen:** Use camelCase for route handler names ([2689eaa](https://github.com/Bombastickj/nuxt-easy-websocket/commit/2689eaa))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v3.3.3

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v3.3.2...v3.3.3)

### 🩹 Fixes

- UseExternalWS return type definition ([d7a211e](https://github.com/Bombastickj/nuxt-easy-websocket/commit/d7a211e))

### 💅 Refactors

- Remove EasyWSExternalRoutes dependency inside useExternalWS ([3a8d901](https://github.com/Bombastickj/nuxt-easy-websocket/commit/3a8d901))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v3.3.2

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v3.3.1...v3.3.2)

### 🩹 Fixes

- Add quotes to object keys ([3f6fb7a](https://github.com/Bombastickj/nuxt-easy-websocket/commit/3f6fb7a))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v3.3.1

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v3.3.0...v3.3.1)

### 🩹 Fixes

- Add quotes to external-socket keys in generated types ([abc36df](https://github.com/Bombastickj/nuxt-easy-websocket/commit/abc36df))

### 🏡 Chore

- Bump package version to 3.3.0 ([6be361c](https://github.com/Bombastickj/nuxt-easy-websocket/commit/6be361c))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v3.3.0

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v3.2.1...v3.3.0)

### 🚀 Enhancements

- **auto-connect:** Added configuration to toggle auto-connect of a socket connection ([e832895](https://github.com/Bombastickj/nuxt-easy-websocket/commit/e832895))

### 🩹 Fixes

- **external-socket:** Fixed incorrect initialization of external socket connections ([7bedfea](https://github.com/Bombastickj/nuxt-easy-websocket/commit/7bedfea))

### 🏡 Chore

- Update dependencies ([aa0069d](https://github.com/Bombastickj/nuxt-easy-websocket/commit/aa0069d))

### 🎨 Styles

- Add missing comma in runtime config options ([c185d43](https://github.com/Bombastickj/nuxt-easy-websocket/commit/c185d43))
- Comment out debug logs in WebSocket creation ([4e35ff9](https://github.com/Bombastickj/nuxt-easy-websocket/commit/4e35ff9))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v3.2.1

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v3.2.0...v3.2.1)

### 🩹 Fixes

- Maintain connection state after termination ([e8475fe](https://github.com/Bombastickj/nuxt-easy-websocket/commit/e8475fe))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v3.2.0

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v3.1.0...v3.2.0)

### 🚀 Enhancements

- Add heartbeat functionality and config options ([218c8f4](https://github.com/Bombastickj/nuxt-easy-websocket/commit/218c8f4))
- Add server and WebSocket heartbeat mechanisms ([3c964d8](https://github.com/Bombastickj/nuxt-easy-websocket/commit/3c964d8))

### 🩹 Fixes

- **client-websocket:** Disable logging and prevent send on server side ([226caa1](https://github.com/Bombastickj/nuxt-easy-websocket/commit/226caa1))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v3.1.0

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v3.0.0...v3.1.0)

### 🚀 Enhancements

- Add new file to define Easy WebSocket Server (WSS) connection for errors ([6f93016](https://github.com/Bombastickj/nuxt-easy-websocket/commit/6f93016))

### 🩹 Fixes

- **module-build:** Fixed building errors coming from breaking changes in @nuxt/module-builder ([c1053b2](https://github.com/Bombastickj/nuxt-easy-websocket/commit/c1053b2))

### 💅 Refactors

- Add debounce to improve dev mode performance ([d36d7f8](https://github.com/Bombastickj/nuxt-easy-websocket/commit/d36d7f8))
- Externalize scanDirectory function ([3536cf5](https://github.com/Bombastickj/nuxt-easy-websocket/commit/3536cf5))
- Update WebSocket message handling data type ([8806fab](https://github.com/Bombastickj/nuxt-easy-websocket/commit/8806fab))

### 🏡 Chore

- Upgraded dependencies ([a163e92](https://github.com/Bombastickj/nuxt-easy-websocket/commit/a163e92))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v3.0.0

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v2.3.4...v3.0.0)

### 🚀 Enhancements

- **server-composables:** ⚠️  Rename WebSocket composables for connection and event handling ([a86b445](https://github.com/Bombastickj/nuxt-easy-websocket/commit/a86b445))
- **server-composables:** ⚠️  Changed scan options for open/close events. ([564ea73](https://github.com/Bombastickj/nuxt-easy-websocket/commit/564ea73))
- Add plugin and route type generation for Nuxt ([065592a](https://github.com/Bombastickj/nuxt-easy-websocket/commit/065592a))
- Add external WebSocket support and refactor routes ([b161620](https://github.com/Bombastickj/nuxt-easy-websocket/commit/b161620))
- Add EasyWSServerPeer to auto-imports ([a401b19](https://github.com/Bombastickj/nuxt-easy-websocket/commit/a401b19))

### 🩹 Fixes

- **ci:** Update npm install command in CI workflow ([3ed0db7](https://github.com/Bombastickj/nuxt-easy-websocket/commit/3ed0db7))
- **types:** Removed export in favor of nitro, fixed wrong import in client declaration file ([62f3b76](https://github.com/Bombastickj/nuxt-easy-websocket/commit/62f3b76))
- **types:** Add return type annotation in useEasyWS function ([28017b4](https://github.com/Bombastickj/nuxt-easy-websocket/commit/28017b4))

### 💅 Refactors

- ⚠️  Improve WebSocket handler consistency ([15f6c90](https://github.com/Bombastickj/nuxt-easy-websocket/commit/15f6c90))
- Streamline socket type definitions ([7f95098](https://github.com/Bombastickj/nuxt-easy-websocket/commit/7f95098))
- Moved NuxtEasyWebSocketContext to types ([23cbd8a](https://github.com/Bombastickj/nuxt-easy-websocket/commit/23cbd8a))
- Restructure app directory paths ([5595f1d](https://github.com/Bombastickj/nuxt-easy-websocket/commit/5595f1d))
- **client-composable:** ⚠️  Rename and adjust event definitions ([413d065](https://github.com/Bombastickj/nuxt-easy-websocket/commit/413d065))

### 🏡 Chore

- **release:** V2.3.4 ([b2d0fca](https://github.com/Bombastickj/nuxt-easy-websocket/commit/b2d0fca))
- ⚠️  Update package version and dependencies for v3.0.0 ([80db973](https://github.com/Bombastickj/nuxt-easy-websocket/commit/80db973))
- Update package version to 3.0.0-alpha.0 ([766c57e](https://github.com/Bombastickj/nuxt-easy-websocket/commit/766c57e))
- **playground:** Updated playground to new implementation ([12794a9](https://github.com/Bombastickj/nuxt-easy-websocket/commit/12794a9))
- Updated module version and dependencies ([85dfb25](https://github.com/Bombastickj/nuxt-easy-websocket/commit/85dfb25))

#### ⚠️ Breaking Changes

- **server-composables:** ⚠️  Rename WebSocket composables for connection and event handling ([a86b445](https://github.com/Bombastickj/nuxt-easy-websocket/commit/a86b445))
- **server-composables:** ⚠️  Changed scan options for open/close events. ([564ea73](https://github.com/Bombastickj/nuxt-easy-websocket/commit/564ea73))
- ⚠️  Improve WebSocket handler consistency ([15f6c90](https://github.com/Bombastickj/nuxt-easy-websocket/commit/15f6c90))
- **client-composable:** ⚠️  Rename and adjust event definitions ([413d065](https://github.com/Bombastickj/nuxt-easy-websocket/commit/413d065))
- ⚠️  Update package version and dependencies for v3.0.0 ([80db973](https://github.com/Bombastickj/nuxt-easy-websocket/commit/80db973))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v2.3.4

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v2.3.3...v2.3.4)

### 🩹 Fixes

- Append WebSocket handler plugin ([682cf3d](https://github.com/Bombastickj/nuxt-easy-websocket/commit/682cf3d))

### 💅 Refactors

- Improve WebSocket plugin readability ([caacb9c](https://github.com/Bombastickj/nuxt-easy-websocket/commit/caacb9c))
- **playground:** Improve reconnection logic with isOpen property ([d8cbf61](https://github.com/Bombastickj/nuxt-easy-websocket/commit/d8cbf61))

### ✅ Tests

- Add new test for index server-side rendering ([22c9205](https://github.com/Bombastickj/nuxt-easy-websocket/commit/22c9205))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v2.3.3

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v2.3.2...v2.3.3)

### 🩹 Fixes

- Separate WebSocket init and connection logic ([0fce15d](https://github.com/Bombastickj/nuxt-easy-websocket/commit/0fce15d))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v2.3.2

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v2.3.1...v2.3.2)

### 🩹 Fixes

- WebSocket handling and state checks ([6b0edc8](https://github.com/Bombastickj/nuxt-easy-websocket/commit/6b0edc8))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v2.3.1

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v2.3.0...v2.3.1)

### 🩹 Fixes

- Improve WebSocket init with onMounted ([2e1f8ae](https://github.com/Bombastickj/nuxt-easy-websocket/commit/2e1f8ae))

### 🏡 Chore

- Upgrade dependencies and devDependencies ([e4e8abb](https://github.com/Bombastickj/nuxt-easy-websocket/commit/e4e8abb))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v2.3.0

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v2.2.1...v2.3.0)

### 🚀 Enhancements

- Add nitropack dependency to package.json ([18830d2](https://github.com/Bombastickj/nuxt-easy-websocket/commit/18830d2))

### 💅 Refactors

- Replace WebSocketState with EasyWSClientState ([e67fd15](https://github.com/Bombastickj/nuxt-easy-websocket/commit/e67fd15))
- Enhance WebSocket handling with types ([fb8d9af](https://github.com/Bombastickj/nuxt-easy-websocket/commit/fb8d9af))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v2.2.1

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v2.2.0...v2.2.1)

### 🩹 Fixes

- **builder:watch:** Rename module files to .mts for correct template update ([360b5d4](https://github.com/Bombastickj/nuxt-easy-websocket/commit/360b5d4))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v2.2.0

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v2.1.3...v2.2.0)

### 🚀 Enhancements

- Add WebSocket reconnection options in Nuxt config ([b581723](https://github.com/Bombastickj/nuxt-easy-websocket/commit/b581723))
- **playground:** Add WebSocket integration and reconnection UI ([b0e7b98](https://github.com/Bombastickj/nuxt-easy-websocket/commit/b0e7b98))

### 🩹 Fixes

- **playground:** Set Nuxt to always use latest ([93704fa](https://github.com/Bombastickj/nuxt-easy-websocket/commit/93704fa))
- **builder:watch:** Add dev mode condition for file watch logic ([b68d349](https://github.com/Bombastickj/nuxt-easy-websocket/commit/b68d349))

### 💅 Refactors

- Improve WebSocket management ([0de8778](https://github.com/Bombastickj/nuxt-easy-websocket/commit/0de8778))

### 🏡 Chore

- Update package and devDependencies versions ([e8332e4](https://github.com/Bombastickj/nuxt-easy-websocket/commit/e8332e4))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v2.1.3

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v2.1.2...v2.1.3)

### 🩹 Fixes

- **types:** Simplify WebSocket event type handling ([c18ae00](https://github.com/Bombastickj/nuxt-easy-websocket/commit/c18ae00))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v2.1.2

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v2.1.1...v2.1.2)

### 🩹 Fixes

- **types:** Add "Serialize" type to enhance the definition of the EasyWSEvent handler functions. ([f721393](https://github.com/Bombastickj/nuxt-easy-websocket/commit/f721393))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v2.1.1

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v2.1.0...v2.1.1)

### 🩹 Fixes

- **build:** Separate TypeScript types for WS events ([b30f277](https://github.com/Bombastickj/nuxt-easy-websocket/commit/b30f277))

### 💅 Refactors

- Update path handling with pathe module ([0f440df](https://github.com/Bombastickj/nuxt-easy-websocket/commit/0f440df))
- Clean up and comment out logging code ([1bd4d86](https://github.com/Bombastickj/nuxt-easy-websocket/commit/1bd4d86))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v2.1.0

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v2.0.0...v2.1.0)

### 🚀 Enhancements

- Add easyWSConnections utility for WebSockets ([4452c71](https://github.com/Bombastickj/nuxt-easy-websocket/commit/4452c71))

### 🩹 Fixes

- Add reconnection logic with error handling ([259f4d9](https://github.com/Bombastickj/nuxt-easy-websocket/commit/259f4d9))

### 💅 Refactors

- Enhance file path handling ([a4e3f08](https://github.com/Bombastickj/nuxt-easy-websocket/commit/a4e3f08))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v2.0.0

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v1.2.1...v2.0.0)

### 🚀 Enhancements

- Add delimiter customization ([56720ae](https://github.com/Bombastickj/nuxt-easy-websocket/commit/56720ae))
- Add builder watch hook for dynamic updates ([9eaa724](https://github.com/Bombastickj/nuxt-easy-websocket/commit/9eaa724))

### 💅 Refactors

- Consolidate import statements into an array ([c048435](https://github.com/Bombastickj/nuxt-easy-websocket/commit/c048435))
- ⚠️  Improve WebSocket routing and structure ([eceb0be](https://github.com/Bombastickj/nuxt-easy-websocket/commit/eceb0be))

### 🎨 Styles

- Improve consistent indentation in route handlers ([6aa9a3c](https://github.com/Bombastickj/nuxt-easy-websocket/commit/6aa9a3c))

#### ⚠️ Breaking Changes

- ⚠️  Improve WebSocket routing and structure ([eceb0be](https://github.com/Bombastickj/nuxt-easy-websocket/commit/eceb0be))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v1.2.1

[compare changes](https://github.com/Bombastickj/nuxt-easy-websocket/compare/v1.2.0...v1.2.1)

### 🩹 Fixes

- Directory path resolution logic for scanning events in layers ([96eafb7](https://github.com/Bombastickj/nuxt-easy-websocket/commit/96eafb7))
- Add promise for WebSocket status handling ([2d5757b](https://github.com/Bombastickj/nuxt-easy-websocket/commit/2d5757b))

### 🏡 Chore

- Update dependencies and remove redundant files ([bb1186d](https://github.com/Bombastickj/nuxt-easy-websocket/commit/bb1186d))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v1.2.0


### 🚀 Enhancements

- **module:** Add basic module ([f87e4d3](https://github.com/Bombastickj/nuxt-easy-websocket/commit/f87e4d3))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

## v1.1.0


### 🚀 Enhancements

- **module:** Initial commit of module ([3c21539](https://github.com/Bombastickj/nuxt-easy-websocket/commit/3c21539))

### ❤️ Contributors

- Jonazzzz <bombastickj@gmail.com>

