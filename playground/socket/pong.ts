export default defineEasyWSClientEvent<{ timestamp: number }>((event) => {
  const diffInMs = Date.now() - event.data.timestamp
  console.log(`[ClientSocket]: pong took: ${diffInMs}ms`)
})
