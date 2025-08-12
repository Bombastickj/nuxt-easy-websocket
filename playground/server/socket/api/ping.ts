export default defineEasyWSEvent<{ timestamp: number }>((event) => {
  event.peer.send('pong', event.data)
})
