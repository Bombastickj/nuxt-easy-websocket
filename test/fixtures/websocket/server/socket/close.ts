import { state } from '../utils/state'
export default defineEasyWSConnection(() => {
  state.disconnections++
})
