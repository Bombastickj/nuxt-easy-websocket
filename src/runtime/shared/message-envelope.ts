export type MessageEnvelope = {
  name: string
  data?: unknown
}

export function isMessageEnvelope(value: unknown): value is MessageEnvelope {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as MessageEnvelope).name === 'string'
  )
}

export function tryParseMessageEnvelope(text: string): MessageEnvelope | null {
  try {
    const parsed: unknown = JSON.parse(text)
    return isMessageEnvelope(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function createMessageEnvelope(
  name: string,
  data?: unknown,
): MessageEnvelope {
  return data === undefined ? { name } : { name, data }
}
