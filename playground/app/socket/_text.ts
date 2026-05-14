export default defineEasyWSEvent<string>((event) => {
  console.log('[Client]: Received raw text:', event.data)
})
