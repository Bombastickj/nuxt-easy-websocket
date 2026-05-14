export default defineEasyWSEvent<string>((event) => {
  console.log('[Server]: Received raw text:', event.data)
  event.peer.sendRaw(event.data)
})
