export type EasyWSBinaryPayload = ArrayBuffer | ArrayBufferView | Blob

export type EasyWSRawPayload = string | EasyWSBinaryPayload

export type EasyWSInboundPayload<T>
  = T extends EasyWSBinaryPayload ? Uint8Array : T

export type EasyWSOutboundPayload<T>
  = T extends EasyWSBinaryPayload ? EasyWSBinaryPayload : T
