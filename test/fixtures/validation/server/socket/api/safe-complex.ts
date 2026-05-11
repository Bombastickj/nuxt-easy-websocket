import { z } from 'zod'
import { defineSafeWSEvent } from '../../utils/safe-ws'

export default defineSafeWSEvent<{
  user: { id: number, name: string },
  tags: string[]
}>(
  z.object({
    user: z.object({
      id: z.number(),
      name: z.string()
    }),
    tags: z.array(z.string())
  }),
  ({ data, peer }) => {
    peer.send('complex-pong', { 
      receivedName: data.user.name,
      tagCount: data.tags.length
    })
  }
)
