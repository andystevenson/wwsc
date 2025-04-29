import { Stripe } from 'stripe'

import { db, eq, payments, paymentExists, subscriptionExists } from '../db'
import { createInvoice, formatInvoice } from './createInvoice'
import { createCustomerFromId } from './createCustomer'
import { createSubscriptionFromId } from './createSubscription'

export async function updateInvoice(invoice: Stripe.Invoice) {
  let { id, subscription, customer } = invoice
  // we're only interested in invoices that are linked to a subscription
  if (!subscription) return
  let subscriptionId =
    typeof subscription === 'string' ? subscription : subscription.id
  let subExists = await subscriptionExists(subscriptionId)
  if (!subExists) {
    let customerId = typeof customer === 'string' ? customer : customer?.id
    if (!customerId) return
    await createCustomerFromId(customerId)
    await createSubscriptionFromId(subscriptionId)
    await createInvoice(invoice)
  }

  let exists = await paymentExists(id)
  if (!exists) {
    await createInvoice(invoice)
    return
  }

  if (!exists.member) return

  let payment = await formatInvoice(exists.member, invoice)
  await db.update(payments).set(payment).where(eq(payments.id, id))
}
