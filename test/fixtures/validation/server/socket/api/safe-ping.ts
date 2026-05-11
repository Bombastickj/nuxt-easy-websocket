import { z } from 'zod'
import { defineSafeWSEvent } from '../../utils/safe-ws'

export default defineSafeWSEvent<{ msg: string }>(
  z.object({
    msg: z.string().min(3)
  }),
  ({ data, peer }) => {
    peer.send('pong', { msg: data.msg })
  }
)
