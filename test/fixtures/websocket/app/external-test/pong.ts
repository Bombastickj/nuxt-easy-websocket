export default defineEasyWSEvent<{ msg: string }>(({ data }) => {
  const ext = useState('external', () => '')
  ext.value = `external:${data.msg}`
})
