import { WebhookEvent } from '../types'
import { Stripe } from 'stripe'
import { createInvoice } from '../sync/createInvoice'

export async function invoiceCreated(event: WebhookEvent) {
  let { object } = event
  if (object.object !== 'invoice') return

  let invoice: Stripe.Invoice = object
  await createInvoice(invoice)
}
