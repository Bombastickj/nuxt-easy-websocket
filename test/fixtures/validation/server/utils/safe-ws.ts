import type { z } from 'zod'
import { defineEasyWSEvent } from '#imports'

export function defineSafeWSEvent<Data>(
  schema: z.ZodTypeAny,
  handler: Parameters<typeof defineEasyWSEvent>[0]
) {
  return defineEasyWSEvent<Data>(async (event) => {
    const result = await schema.safeParseAsync(event.data)
    if (!result.success) {
      event.peer.send('error', { message: 'Invalid data', errors: result.error.format() })
      return
    }
    return handler({ ...event, data: result.data as Data })
  })
}
