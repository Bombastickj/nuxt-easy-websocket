export default defineEasyWSEvent<Uint8Array>((event) => {
  const rawBinary = useState('raw-binary', () => '')
  rawBinary.value = event.data.join(',')
})
