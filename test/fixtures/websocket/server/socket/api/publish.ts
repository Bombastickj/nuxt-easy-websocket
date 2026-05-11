export default defineEasyWSEvent<{ topic: string, msg: string }>(async ({ data, peer }) => {
  // In EasyWSPeer, name is used as topic AND event name in body
  await peer.publish(data.topic, { msg: data.msg })
})
