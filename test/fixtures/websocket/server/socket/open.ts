import { state } from '../utils/state'
export default defineEasyWSConnection((event) => {
  state.connections++
  event.peer.send('welcome', { id: event.peer.peer.id })
})
