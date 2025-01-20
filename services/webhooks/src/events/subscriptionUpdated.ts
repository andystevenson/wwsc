import { WebhookEvent } from '../types'
import { Stripe } from 'stripe'
import { updateSubscription } from '../sync/updateSubscription'

export async function subscriptionUpdated(event: WebhookEvent) {
  let { object } = event
  if (object.object !== 'subscription') return

  let subscription: Stripe.Subscription = object
  await updateSubscription(subscription)
}
