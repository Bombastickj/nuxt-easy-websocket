export default defineEasyWSEvent<ArrayBuffer>(({ data }) => {
  const binaryEcho = useState('binary-echo', () => '')

  binaryEcho.value = Array.from(data).join(',')
})
