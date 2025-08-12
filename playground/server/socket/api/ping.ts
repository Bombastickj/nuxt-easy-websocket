export default defineEasyWSEvent<{ timestamp: number }>((event) => {
  event.peer.send('pong', event.data)

  // event.peer.send('types-test-0')
})
