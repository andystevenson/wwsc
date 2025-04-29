import { db, and, eq, lte, members, subscriptions } from '../src/db'
import { dayjs } from '@wwsc/lib-dates'
import { write } from 'bun'
import { stringify } from 'csv-stringify/sync'

let staff = await db
  .select({
    firstName: members.firstName,
    surname: members.surname,
    dob: members.dob,
    email: members.email
  })
  .from(subscriptions)
  .where(
    and(
      eq(subscriptions.status, 'active'),
      eq(subscriptions.membership, 'staff-yearly')
    )
  )
  .innerJoin(members, eq(members.id, subscriptions.member))

let csv = stringify(staff, { header: true })
console.log('written', staff.length, 'emails to email-staff.csv')
write('email-staff.csv', csv)
