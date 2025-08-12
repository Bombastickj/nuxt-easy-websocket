interface MyCustomType {
  timestamp: number
  foo: string
  bar: string
  foobar?: Date
}

export default defineEasyWSEvent<MyCustomType>((event) => {
  const diffInMs = Date.now() - event.data.timestamp
  console.log(`[ClientSocket]: pong took: ${diffInMs}ms`)
})
