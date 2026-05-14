export default defineEasyWSEvent<Uint8Array>((event) => {
  console.log('[Server]: Received raw binary:', event.data)
  event.peer.sendRaw(event.data)
})
