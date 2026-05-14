import type { EasyWSBinaryPayload, EasyWSRawPayload } from '../shared-types'

export const EASY_WS_BINARY_MAGIC_0 = 0xE7
export const EASY_WS_BINARY_MAGIC_1 = 0x57

export const EASY_WS_BINARY_NAME_LENGTH_OFFSET = 2
export const EASY_WS_BINARY_NAME_LENGTH_SIZE = 4
export const EASY_WS_BINARY_HEADER_SIZE = EASY_WS_BINARY_NAME_LENGTH_OFFSET + EASY_WS_BINARY_NAME_LENGTH_SIZE

export const EASY_WS_BINARY_MAX_NAME_LENGTH = 0xFFFFFFFF

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

function isBlob(value: unknown): value is Blob {
  return typeof Blob !== 'undefined' && value instanceof Blob
}

export async function toUint8Array(
  value: EasyWSBinaryPayload,
): Promise<Uint8Array> {
  if (isBlob(value)) {
    return new Uint8Array(await value.arrayBuffer())
  }

  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value)
  }

  return new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
}

export function toUint8ArraySync(
  value: ArrayBuffer | ArrayBufferView,
): Uint8Array {
  return value instanceof ArrayBuffer
    ? new Uint8Array(value)
    : new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
}

export function isEasyWSBinaryPayload(
  value: unknown,
): value is EasyWSBinaryPayload {
  return (
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value) ||
    isBlob(value)
  )
}

export function isEasyWSBinaryFrame(bytes: Uint8Array) {
  return (
    bytes.byteLength >= EASY_WS_BINARY_HEADER_SIZE &&
    bytes[0] === EASY_WS_BINARY_MAGIC_0 &&
    bytes[1] === EASY_WS_BINARY_MAGIC_1
  )
}

export async function createEasyWSBinaryFrame(
  name: string,
  data: EasyWSBinaryPayload,
): Promise<ArrayBuffer> {
  const payload = await toUint8Array(data)
  const nameBytes = textEncoder.encode(name)

  if (nameBytes.byteLength === 0) {
    throw new RangeError('WebSocket event name cannot be empty')
  }

  if (nameBytes.byteLength > EASY_WS_BINARY_MAX_NAME_LENGTH) {
    throw new RangeError(`WebSocket event name is too long: ${name}`)
  }

  const buffer = new ArrayBuffer(
    EASY_WS_BINARY_HEADER_SIZE + nameBytes.byteLength + payload.byteLength,
  )

  const frame = new Uint8Array(buffer)
  const view = new DataView(buffer)

  frame[0] = EASY_WS_BINARY_MAGIC_0
  frame[1] = EASY_WS_BINARY_MAGIC_1

  view.setUint32(
    EASY_WS_BINARY_NAME_LENGTH_OFFSET,
    nameBytes.byteLength,
    false,
  )

  frame.set(nameBytes, EASY_WS_BINARY_HEADER_SIZE)
  frame.set(payload, EASY_WS_BINARY_HEADER_SIZE + nameBytes.byteLength)

  return buffer
}

export function parseEasyWSBinaryFrame(
  data: ArrayBuffer | ArrayBufferView,
): { name: string; data: Uint8Array } {
  const bytes = toUint8ArraySync(data)

  if (!isEasyWSBinaryFrame(bytes)) {
    throw new Error('Invalid binary WebSocket frame: missing EasyWS magic header')
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const nameLength = view.getUint32(
    EASY_WS_BINARY_NAME_LENGTH_OFFSET,
    false,
  )

  if (nameLength === 0) {
    throw new Error('Invalid binary WebSocket frame: empty event name')
  }

  if (bytes.byteLength < EASY_WS_BINARY_HEADER_SIZE + nameLength) {
    throw new Error('Invalid binary WebSocket frame: truncated event name')
  }

  const name = textDecoder.decode(
    bytes.subarray(
      EASY_WS_BINARY_HEADER_SIZE,
      EASY_WS_BINARY_HEADER_SIZE + nameLength,
    ),
  )

  const payload = bytes.subarray(EASY_WS_BINARY_HEADER_SIZE + nameLength)

  return { name, data: payload }
}

export function tryParseEasyWSBinaryFrame(
  data: ArrayBuffer | ArrayBufferView,
): { name: string; data: Uint8Array } | null {
  const bytes = toUint8ArraySync(data)

  if (!isEasyWSBinaryFrame(bytes)) {
    return null
  }

  return parseEasyWSBinaryFrame(bytes)
}

function copyToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(buffer).set(bytes)
  return buffer
}

export async function toWebSocketBody(
  value: EasyWSRawPayload,
): Promise<string | ArrayBuffer> {
  if (typeof value === 'string') {
    return value
  }

  const bytes = await toUint8Array(value)

  if (
    bytes.buffer instanceof ArrayBuffer &&
    bytes.byteOffset === 0 &&
    bytes.byteLength === bytes.buffer.byteLength
  ) {
    return bytes.buffer
  }

  return copyToArrayBuffer(bytes)
}
