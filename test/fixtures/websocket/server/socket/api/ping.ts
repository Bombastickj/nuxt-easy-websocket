export default defineEasyWSEvent<{ msg: string }>((event) => {
  event.peer.send('pong', { msg: event.data.msg })
})
