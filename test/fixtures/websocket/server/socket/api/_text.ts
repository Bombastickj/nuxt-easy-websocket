export default defineEasyWSEvent<string>((event) => {
  event.peer.sendRaw('echo:' + event.data)
})
