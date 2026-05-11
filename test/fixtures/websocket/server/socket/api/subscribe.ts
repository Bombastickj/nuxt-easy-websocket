export default defineEasyWSEvent<{ topic: string }>(async ({ data, peer }) => {
  await peer.subscribe(data.topic)
  await peer.send('subscribed', { topic: data.topic })
})
