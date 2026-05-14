export default defineEasyWSEvent<Uint8Array>((event) => {
  console.log('[Client]: Received raw binary:', event.data)
})
