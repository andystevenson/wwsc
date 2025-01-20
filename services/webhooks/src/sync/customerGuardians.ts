import { Stripe } from 'stripe'
import { age as getAge } from '@wwsc/lib-dates'
import { stripe } from '@lib/stripe/wwsc'
import { db, eq, guardians, type InsertGuardian } from '../db'

export async function customerGuardians(customer: Stripe.Customer) {
  // clear out any existing guardian data
  await db.delete(guardians).where(eq(guardians.member, customer.id))
  let list = await guardiansFromStripe(customer)
  for (let guardian of list) {
    await db
      .insert(guardians)
      .values(guardian)
      .onConflictDoUpdate({
        target: [guardians.member, guardians.name],
        set: guardian
      })
  }
}

async function guardiansFromStripe(customer: Stripe.Customer) {
  let list: InsertGuardian[] = []

  let { metadata, phone, email, name } = customer
  let { dob, guardian, guardian2, guardian2mobile, guardian2email } = metadata
  if (guardian) {
    list.push({
      member: customer.id,
      name: guardian,
      mobile: phone || '',
      email: email || ''
    })
  }

  if (guardian2) {
    list.push({
      member: customer.id,
      name: metadata.guardian2,
      mobile: guardian2mobile || '',
      email: guardian2email || ''
    })
  }

  if (dob) {
    let linkedWith = metadata['linked-with']
    let age = getAge(dob)
    if (age < 18 && linkedWith) {
      let guardianCustomer = await stripe.customers.retrieve(linkedWith)
      if (guardianCustomer && !guardianCustomer.deleted) {
        let { id, name: gName, phone: gPhone, email: gEmail } = guardianCustomer
        if (
          ['WestWarwicksHockeyClub', 'WestWarwicksCricketClub'].includes(
            gName || ''
          )
        ) {
          return list
        }
        console.log('updating', name, 'aged', age, 'from', gName)
        list.push({
          member: id,
          name: gName || email || 'unknown',
          mobile: gPhone || phone || '',
          email: gEmail || email || ''
        })
      }
    }
  }

  return list
}
