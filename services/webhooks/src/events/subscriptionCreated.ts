import { WebhookEvent } from '../types'
import { Stripe } from 'stripe'
import { createSubscription } from '../sync/createSubscription'

export async function subscriptionCreated(event: WebhookEvent) {
  let { object } = event
  if (object.object !== 'subscription') return

  let subscription: Stripe.Subscription = object
  let { id, customer } = subscription
  await createSubscription(subscription)
}
