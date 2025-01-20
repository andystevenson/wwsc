import { stripe, webhook } from '@lib/stripe/wwsc'
import { queue } from './sync'

type WebhookEvent = { type: string; object: any }
async function handleRequest(request: Request): Promise<Response> {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    if (!signature) throw new TypeError('webhook stripe signature missing')

    const stripeEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhook
    )

    const { type } = stripeEvent
    const { object } = stripeEvent.data

    // queue the event for processing
    queue({ type, object })

    return new Response(`${type} processed`, { status: 200 })
  } catch (error) {
    if (error instanceof TypeError) {
      console.error('webhook error', error.message)
      return new Response('Bad request', { status: 400 })
    }

    console.error('webhook error', error)
    return new Response('Bad request', { status: 400 })
  }
}

let port = process.env.WWSC_WEBHOOKS_PORT
if (!port) {
  console.error('WWSC_WEBHOOKS_PORT not set')
  process.exit(1)
}

console.log(`webhooks on port ${port}`)

Bun.serve({
  port,
  fetch: handleRequest
})
