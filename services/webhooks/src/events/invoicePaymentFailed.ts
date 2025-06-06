import { WebhookEvent } from '../types'
import { Stripe } from 'stripe'
import { updateInvoice } from '../sync/updateInvoice'

export async function invoicePaymentFailed(event: WebhookEvent) {
  let { object } = event
  if (object.object !== 'invoice') return

  let invoice: Stripe.Invoice = object
  await updateInvoice(invoice)
}
