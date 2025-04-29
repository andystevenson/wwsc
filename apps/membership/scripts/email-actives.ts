import { db, and, eq, lte, members, subscriptions } from '../src/db'
import { dayjs } from '@wwsc/lib-dates'
import { write } from 'bun'
import { stringify } from 'csv-stringify/sync'

let d18yrsAgo = dayjs().subtract(18, 'years').format('YYYY-MM-DD')

// select everyone over 18 years old with an active subscription

let actives = await db
  .select({
    firstName: members.firstName,
    surname: members.surname,
    dob: members.dob,
    email: members.email
  })
  .from(subscriptions)
  .where(and(eq(subscriptions.status, 'active'), lte(members.dob, d18yrsAgo)))
  .innerJoin(members, eq(members.id, subscriptions.member))

let csv = stringify(actives, { header: true })
console.log('written', actives.length, 'emails to email-actives.csv')
write('email-actives.csv', csv)
