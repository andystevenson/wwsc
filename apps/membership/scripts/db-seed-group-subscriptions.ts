import { dayjs } from '@wwsc/lib-dates'
import {
  db,
  eq,
  InsertSubscription,
  memberships,
  subscriptions
} from '../src/db/db'

import { stripe } from '../src/stripe'

import { exit } from 'node:process'

let cricket = await db.query.memberships.findFirst({
  where: eq(memberships.id, 'cricket-club-monthly')
})

let hockey = await db.query.memberships.findFirst({
  where: eq(memberships.id, 'hockey-club-monthly')
})

if (!cricket || !hockey) {
  console.error('cricket or hockey membership type not found')
  exit(1)
}

const groupSubscriptions: InsertSubscription[] = [
  {
    membership: cricket.id,
    payment: 'bacs',
    scope: 'group',
    status: 'active',
    started: dayjs().startOf('month').format('YYYY-MM-DD'),
    renews: dayjs().endOf('month').format('YYYY-MM-DD')
  },
  {
    membership: hockey.id,
    payment: 'bacs',
    scope: 'group',
    status: 'active',
    started: dayjs().startOf('month').format('YYYY-MM-DD'),
    renews: dayjs().endOf('month').format('YYYY-MM-DD')
  }
]

let result = await db
  .insert(subscriptions)
  .values(groupSubscriptions)
  .returning()
console.log('inserted group subscription records %o', result.length)
