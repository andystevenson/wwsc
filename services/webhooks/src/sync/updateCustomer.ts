import { Stripe } from 'stripe'
import { dayjs } from '@wwsc/lib-dates'
import { db, eq, members, events } from '../db'
import { type UpdateMember } from '../db'
import { formatNameToFirstNameSurname, formatStripeAddress } from '../utilities'
import { customerMetadata } from './customerMetadata'

export async function updateCustomer(customer: Stripe.Customer) {
  try {
    let { metadata } = customer
    return updateFromStripeCustomer(customer)
  } catch (error) {
    console.error('Error creating customer:', error)
  }
}

export async function updateFromStripeCustomer(customer: Stripe.Customer) {
  let { id } = customer
  let exits = await db.query.members.findFirst({ where: eq(members.id, id) })
  if (!exits) {
    console.log('no member found', id)
    return
  }

  let { metadata, name, address, email, phone } = customer
  let { dob, createdBy } = metadata
  let linkedWith = metadata['linked-with'] || null
  let { postal_code } = address || {}

  if (!name) throw new TypeError(`no name, ${customer.id}`)
  let { firstName, surname } = formatNameToFirstNameSurname(name)
  let dateOfBirth =
    dob && dayjs(dob).isValid() ? dayjs(dob).format('YYYY-MM-DD') : null

  let member: UpdateMember = {
    createdBy: createdBy || 'andy@westwarwicks.co.uk',
    firstName,
    surname,
    address: formatStripeAddress(address),
    postcode: postal_code,
    dob: dateOfBirth || '',
    email,
    mobile: phone,
    linkedWith
  }

  let updated = await db.update(members).set(member).where(eq(members.id, id))
  await customerMetadata(customer)
  await updatedEvent(customer)
  return updated
}

export async function updatedEvent(customer: Stripe.Customer) {
  let { id } = customer
  return db.insert(events).values({ member: id, type: 'updated' })
}
