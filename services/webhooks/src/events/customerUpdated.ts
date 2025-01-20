import { WebhookEvent } from '../types'
import { Stripe } from 'stripe'
import { updateCustomer } from '../sync/updateCustomer'

export async function customerUpdated(event: WebhookEvent) {
  let { object } = event
  if (object.object !== 'customer') return

  let customer: Stripe.Customer = object
  await updateCustomer(customer)
  let { id, name, email } = customer
  console.log(' customer updated', id, name, email)
}
