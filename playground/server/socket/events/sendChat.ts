export default defineEasyWSEvent<{ chatId: number, message: string }>((event) => {
  const { chatId, message } = event.data
  console.log('Recieved chat message for chat: ', chatId, ' with message: ', message)
})
