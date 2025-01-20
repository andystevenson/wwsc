import { Stripe } from 'stripe'
import { db, eq, members, events } from '../db'
import { type UpdateMember } from '../db'
import { customerMetadata } from './customerMetadata'

export async function deleteCustomer(customer: Stripe.Customer) {
  try {
    return deleteFromStripeCustomer(customer)
  } catch (error) {
    console.error('Error creating customer:', error)
  }
}

export async function deleteFromStripeCustomer(customer: Stripe.Customer) {
  let { id } = customer
  let exits = await db.query.members.findFirst({ where: eq(members.id, id) })
  if (!exits) {
    return
  }

  let { metadata } = customer
  let { createdBy } = metadata
  let linkedWith = null

  let member: UpdateMember = {
    createdBy: createdBy || 'andy@westwarwicks.co.uk',
    linkedWith
  }

  let updated = await db.update(members).set(member).where(eq(members.id, id))
  await customerMetadata(customer)
  await deletedEvent(customer)
  return updated
}

export async function deletedEvent(customer: Stripe.Customer) {
  let { id } = customer
  return db.insert(events).values({ member: id, type: 'deleted' })
}
