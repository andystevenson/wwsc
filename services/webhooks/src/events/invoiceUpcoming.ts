import { WebhookEvent } from '../types'
import { Stripe } from 'stripe'
import { updateInvoice } from '../sync/updateInvoice'

export async function invoiceUpcoming(event: WebhookEvent) {
  let { object } = event
  if (object.object !== 'invoice') return

  let invoice: Stripe.Invoice = object
  let { id } = invoice
  console.log(`invoice ${id} is upcoming`)
  await updateInvoice(invoice)
}
