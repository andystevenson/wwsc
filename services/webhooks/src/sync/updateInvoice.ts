import { Stripe } from 'stripe'

import { db, eq, payments, paymentExists } from '../db'
import { formatInvoice } from './createInvoice'

export async function updateInvoice(invoice: Stripe.Invoice) {
  let { id } = invoice
  let exists = await paymentExists(id)
  if (!exists || !exists.member) return

  let payment = await formatInvoice(exists.member, invoice)
  await db.update(payments).set(payment).where(eq(payments.id, id))
}
