console.log('hello from the webhooks service!')

async function handleRequest(request: Request): Promise<Response> {
  if (request.headers.get('Content-Type') === 'application/json') {
    let json = await request.json()
    let response = JSON.stringify(json, null, 2)
    console.log('Received webhook:', response)
    return new Response(response, {
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return new Response('Bad request', { status: 400 })
}

let port = process.env.WEBHOOKS_PORT
if (!port) {
  console.error('WEBHOOKS_PORT not set')
  process.exit(1)
}

console.log(`webhooks on port ${port}`)

Bun.serve({
  port,
  fetch: handleRequest,
})
