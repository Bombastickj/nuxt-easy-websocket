export default defineEasyWSUpgrade((request) => {
  const token = new URL(request.url, 'http://localhost').searchParams.get('token')

  if (token !== 'let-me-in') {
    throw new Response(null, { status: 401, statusText: 'Unauthorized' })
  }

  return { context: { user: token } }
})