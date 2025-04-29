import { Stripe } from 'stripe'
import { stripe } from '@lib/stripe/wwsc'
import { dayjs } from '@wwsc/lib-dates'

import { db, payments, memberExists } from '../db'
import type { InsertPayment, ID } from '../db'

export async function createInvoice(invoice: Stripe.Invoice) {
  let { customer } = invoice
  if (!customer) return

  let customerId = typeof customer === 'string' ? customer : customer.id
  let exists = await memberExists(customerId)
  if (!exists) return

  let payment = await formatInvoice(exists.id, invoice)

  let [result] = await db
    .insert(payments)
    .values(payment)
    .onConflictDoUpdate({ target: [payments.id], set: payment })
    .returning()

  return result
}

export async function formatInvoice(customer: ID, invoice: Stripe.Invoice) {
  let date = ''
  let {
    id,
    attempt_count,
    collection_method,
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
    status,
    amount_due,
    due_date,
    status_transitions,
    paid_out_of_band,
    charge,
    invoice_pdf,
    hosted_invoice_url
  } = invoice

  if (collection_method === 'charge_automatically') {
    let { paid_at, marked_uncollectible_at, voided_at, finalized_at } =
      status_transitions

    if (paid_at) date = dayjs.unix(paid_at).format('YYYY-MM-DD')
    if (marked_uncollectible_at)
      date = dayjs.unix(marked_uncollectible_at).format('YYYY-MM-DD')
    if (voided_at) date = dayjs.unix(voided_at).format('YYYY-MM-DD')
    if (!date && finalized_at)
      date = dayjs.unix(finalized_at).format('YYYY-MM-DD')
  }

  if (collection_method === 'send_invoice' && due_date) {
    date = dayjs.unix(due_date).format('YYYY-MM-DD')
  }

  let receipt = ''
  let type = ''
  let refunded = 0
  let amount = 0
  let actualCharge: Stripe.Charge | undefined
  if (charge && typeof charge === 'string') {
    let chargeId = charge
    actualCharge = await stripe.charges.retrieve(chargeId)
  }

  if (charge && typeof charge === 'object') {
    actualCharge = charge
  }

  if (actualCharge) {
    let {
      receipt_url,
      refunded: cRefunded,
      amount: camount,
      amount_refunded,
      payment_method_details
    } = actualCharge

    receipt = receipt_url || ''
    refunded = cRefunded ? amount_refunded : 0
    amount = camount
    if (payment_method_details) {
      let { type: pmType, card } = payment_method_details
      type = pmType
      if (card) {
        let { brand } = card
        type = brand ? brand : pmType
      }
    }
  }

  let collection = collection_method
  let url = hosted_invoice_url
  let pdf = invoice_pdf
  if (amount === 0) amount = amount_due

  let payment: InsertPayment = {
    id,
    date,
    amount,
    status,
    type: paid_out_of_band ? 'cash' : type,
    collection,
    name,
    email,
    phone,
    url,
    pdf,
    receipt,
    refunded,
    attempts: attempt_count,
    member: customer
  }

  return payment
}
