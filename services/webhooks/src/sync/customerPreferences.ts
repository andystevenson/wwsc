import { Stripe } from 'stripe'
import { db, eq, preferences, PreferenceTypes } from '../db'
import type { InsertPreference, PreferenceType } from '../db'

export async function customerPreferences(customer: Stripe.Customer) {
  let { metadata } = customer
  let { preferences: inputPreferences } = metadata
  // clear out any existing preferences
  await db.delete(preferences).where(eq(preferences.member, customer.id))

  if (!inputPreferences) return

  let prefs = inputPreferences.split(',').map((p: string) => p.trim())
  let insertPrefs: InsertPreference[] = prefs
    .filter((p) => PreferenceTypes.includes(p as PreferenceType))
    .map((p) => {
      return {
        type: p as PreferenceType,
        member: customer.id
      }
    })

  return db.insert(preferences).values(insertPrefs).onConflictDoNothing()
}
