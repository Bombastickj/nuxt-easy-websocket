export default defineEasyWSEvent<string>((event) => {
  const rawText = useState('raw-text', () => '')
  rawText.value = event.data
})
