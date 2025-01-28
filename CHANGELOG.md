# Changelog


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

