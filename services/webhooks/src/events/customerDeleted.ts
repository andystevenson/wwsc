import { WebhookEvent } from '../types'
import { Stripe } from 'stripe'
import { deleteCustomer } from '../sync/deleteCustomer'

export async function customerDeleted(event: WebhookEvent) {
  let { object } = event
  if (object.object !== 'customer') return

  let customer: Stripe.Customer = object
  await deleteCustomer(customer)
}
