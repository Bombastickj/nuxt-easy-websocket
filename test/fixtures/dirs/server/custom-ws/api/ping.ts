export default defineEasyWSEvent<{ msg: string }>((event) => {
  event.peer.send('custom-pong', { msg: event.data.msg })
})
