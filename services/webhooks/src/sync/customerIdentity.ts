import { Stripe } from 'stripe'
import { db, identities, type InsertIdentity } from '../db'

export async function customerIdentity(customer: Stripe.Customer) {
  let { metadata } = customer
  let { memberNo, cardNo, student } = metadata

  if (memberNo || cardNo) {
    let identity: InsertIdentity = {
      id: customer.id,
      memberNo: memberNo?.trim(),
      card: cardNo?.trim(),
      student: student?.trim()
    }

    return db
      .insert(identities)
      .values(identity)
      .onConflictDoUpdate({ target: [identities.id], set: identity })
  }
}
