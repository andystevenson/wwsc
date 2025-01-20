import { Stripe } from 'stripe'
import { db, genders, GenderTypes } from '../db'
import type { GenderType, InsertGender } from '../db'

export async function customerGender(customer: Stripe.Customer) {
  let { metadata } = customer
  let { gender } = metadata

  let lGender: GenderType = gender.toLowerCase() as GenderType
  let g: GenderType = GenderTypes.includes(lGender) ? lGender : 'unknown'

  let insertGender: InsertGender = {
    id: customer.id,
    gender: g,
    other: ''
  }

  await db
    .insert(genders)
    .values(insertGender)
    .onConflictDoUpdate({ target: [genders.id], set: insertGender })
}
