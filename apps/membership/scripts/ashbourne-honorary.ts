import { migrateSimpleCategory } from './ashbourne-migrate-category'
import {
  db,
  eq,
  members,
  memberships,
  preferences,
  subscriptions,
  type Category,
  type ID
} from '../src/db/db'

import {
  createStripeCustomer,
  createStripeSubscription
} from './wwarms-links-stripe'

import { syncToStripe } from './wwarms-links-stripe'
// Rob Owen => honorary
// Dan Evans => honorary
// Sarah-Jane Perry => honorary
// Paul Coll => honorary
const memberList: string[] = ['1151835', '1151604', '3312762', '1170186']
const memType = 'honorary'
const membership = 'honorary-yearly'

export async function migrateHonorary() {
  await migrateSimpleCategory(memberList, membership)

  // update the preferences for honorary members
  await honoraryPreferences()

  // sync with stripe
  await syncToStripe(memType, membership)

  console.log('done')
}

export async function honoraryPreferences() {
  let honoraries = await db
    .select({
      id: members.id,
      firstName: members.firstName,
      surname: members.surname,
      category: memberships.category,
      preference: preferences.type
    })
    .from(memberships)
    .where(eq(memberships.category, 'honorary'))
    .innerJoin(subscriptions, eq(subscriptions.membership, memberships.id))
    .innerJoin(members, eq(members.subscription, subscriptions.id))
    .innerJoin(preferences, eq(preferences.member, members.id))

  const preferSquash = new Set<string>()
  const preferTennis = new Set<string>()
  const rollcall = new Set<string>()
  honoraries.forEach((honorary) => {
    const { preference, firstName, surname } = honorary
    rollcall.add(`${firstName} ${surname}`)
    if (preference === 'squash') {
      preferSquash.add(`${firstName} ${surname}`)
    }

    if (preference === 'tennis') {
      preferTennis.add(`${firstName} ${surname}`)
    }
  })

  if (rollcall.size !== 4) {
    throw new Error('Expected 4 honorary members')
  }

  await Promise.all(
    ['Rob Owen', 'Sarah-Jane Perry', 'Paul Coll'].map(async (name) => {
      if (!preferSquash.has(name)) {
        let who = honoraries.find((h) => `${h.firstName} ${h.surname}` === name)
        if (!who) {
          throw new Error(`Could not find ${name}`)
        }

        let p = await db
          .insert(preferences)
          .values({ member: who.id, type: 'squash' })
          .returning()
        // console.log(`Adding squash preference for ${name}`, p)
        return p
      }
    })
  )

  await Promise.all(
    ['Dan Evans'].map(async (name) => {
      if (!preferTennis.has(name)) {
        let who = honoraries.find((h) => `${h.firstName} ${h.surname}` === name)
        if (!who) {
          throw new Error(`Could not find ${name}`)
        }

        let p = await db
          .insert(preferences)
          .values({ member: who.id, type: 'tennis' })
          .returning()
        // console.log(`Adding tennis preference for ${name}`, p)
        return p
      }
    })
  )
}

// TODO: promote to higher level process
// TODO: SJ, PC dob in ashbourne
await migrateHonorary()
