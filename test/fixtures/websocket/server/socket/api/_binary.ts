export default defineEasyWSEvent<Uint8Array>((event) => {
  event.peer.sendRaw(event.data)
})
