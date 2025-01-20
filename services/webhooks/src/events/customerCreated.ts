import { WebhookEvent } from '../types'
import { Stripe } from 'stripe'
import { createCustomer } from '../sync/createCustomer'

export async function customerCreated(event: WebhookEvent) {
  let { object } = event
  if (object.object !== 'customer') return

  let customer: Stripe.Customer = object
  let { id, name, email } = customer
  let created = await createCustomer(customer)
  console.log(' customer created', id, name, email, created)
}
