import { state } from '../utils/state'

export default defineEasyWSConnection((event) => {
  state.connections++
  event.peer.send('welcome', { user: event.peer.peer.context?.user ?? null })
})