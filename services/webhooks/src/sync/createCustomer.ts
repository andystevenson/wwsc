import { Stripe } from 'stripe'
import { stripe } from '@lib/stripe/wwsc'
import { dayjs } from '@wwsc/lib-dates'
import { db, members, type InsertMember, type ID } from '../db'
import { formatNameToFirstNameSurname, formatStripeAddress } from '../utilities'
import { customerMetadata } from './customerMetadata'

export async function createCustomer(
  customer: Stripe.Customer,
  checkWWSC = true
) {
  console.log('  creating customer:', customer.id)

  try {
    let { metadata } = customer
    let { wwsc } = metadata

    // only interested in stripe customers with wwsc metadata
    if (checkWWSC && wwsc !== 'true') return
    return fromStripeCustomer(customer)
  } catch (error) {
    console.error('error creating customer:', error)
  }
}

export async function createCustomerFromId(id: ID) {
  let customer = await stripe.customers.retrieve(id)
  if (!customer || customer.deleted) return
  return fromStripeCustomer(customer)
}

export async function fromStripeCustomer(customer: Stripe.Customer) {
  let { id, metadata, name, address, email, phone } = customer
  let { dob, createdBy } = metadata
  let linkedWith = metadata['linked-with'] || null
  let { postal_code } = address || {}

  if (!name) throw new TypeError(`no name, ${customer.id}`)
  let { firstName, surname } = formatNameToFirstNameSurname(name)
  let dateOfBirth =
    dob && dayjs(dob).isValid() ? dayjs(dob).format('YYYY-MM-DD') : null

  let member: InsertMember = {
    id,
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

  let created = await db
    .insert(members)
    .values(member)
    .onConflictDoUpdate({ target: [members.id], set: member })
    .returning()

  await customerMetadata(customer)

  console.log('customer created:', created)
  return created
}
