export default defineEasyWSEvent<ArrayBuffer>((event) => {
  event.peer.send('binary-echo', event.data)
})
