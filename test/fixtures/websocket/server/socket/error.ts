import { state } from '../utils/state'
export default defineEasyWSConnection(() => {
  state.errors = (state.errors || 0) + 1
})
