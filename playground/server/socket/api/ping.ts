export default defineEasyWSSEvent<{ timestamp: number }>((event) => {
  event.peer.send('pong', event.data)
})
