export default defineEasyWSEvent<{ id: string }>(({ data }) => {
  const welcome = useState('welcome', () => '')
  welcome.value = `welcome:${data.id}`
})
