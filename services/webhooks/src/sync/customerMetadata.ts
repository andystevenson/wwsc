import { db } from '../db'
import { Stripe } from 'stripe'
import { customerIdentity } from './customerIdentity'
import { customerPreferences } from './customerPreferences'
import { customerGender } from './customerGender'
import { customerJoined } from './customerJoined'
import { customerAshbourneNotes } from './customerAshbourneNotes'
import { customerGuardians } from './customerGuardians'

export async function customerMetadata(customer: Stripe.Customer) {
  await customerIdentity(customer)
  await customerPreferences(customer)
  await customerGender(customer)
  await customerJoined(customer)
  await customerAshbourneNotes(customer)
  await customerGuardians(customer)
}
