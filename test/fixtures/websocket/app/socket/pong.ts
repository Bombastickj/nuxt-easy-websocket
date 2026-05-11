export default defineEasyWSEvent<{ msg: string }>(({ data }) => {
  const pong = useState('pong', () => '')
  pong.value = `pong:${data.msg}`
})
