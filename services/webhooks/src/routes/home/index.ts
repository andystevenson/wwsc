import { factory } from '../../hono'
import { stripe, webhook } from '@lib/stripe/wwsc'
import { queue, start } from '../../sync'
const home = factory.createApp()

let started = false
home.post('/', async (c) => {
  if (!started) {
    await start(c.var.logger)
    started = true
  }
  try {
    const body = await c.req.text()
    const signature = c.req.header('stripe-signature')
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

    let message = `${type} processed`
    return c.json({ message }, 200)
  } catch (error) {
    if (error instanceof Error) {
      let message = `webhook error`
      c.var.logger.error(message, error)
      return c.json({ message }, 400)
    }
  }
  return c.status(200)
})

export default home
