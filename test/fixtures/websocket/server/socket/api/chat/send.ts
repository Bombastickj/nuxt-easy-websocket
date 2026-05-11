export default defineEasyWSEvent<{ msg: string }>((event) => {
  event.peer.send('chat/msg', { msg: event.data.msg })
})
