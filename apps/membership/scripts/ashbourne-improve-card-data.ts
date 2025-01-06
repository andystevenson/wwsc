import { db, ashbourne, eq, and, ne } from '../src/db/db'
import { dayjs } from '@wwsc/lib-dates'

const all = await db
  .select({
    memberNo: ashbourne.memberNo,
    cardNo: ashbourne.cardNo,
    firstName: ashbourne.firstName,
    surname: ashbourne.surname
  })
  .from(ashbourne)

console.log('Checking card numbers...')
let missing = new Set<string>()
for (const row of all) {
  if (!row.cardNo) {
    // console.log(row.memberNo, row.firstName, row.surname, 'no card number')
    missing.add(row.memberNo)
  }
}

console.log('Missing card numbers:', missing.size)

for (const memberNo of missing) {
  let [member] = await db
    .select()
    .from(ashbourne)
    .where(eq(ashbourne.memberNo, memberNo))

  // see if any one with the same name has a card number
  let similar = await db
    .select()
    .from(ashbourne)
    .where(
      and(
        eq(ashbourne.firstName, member.firstName),
        eq(ashbourne.surname, member.surname),
        ne(ashbourne.cardNo, '')
      )
    )

  if (similar.length > 0) {
    console.log(
      'card no found for',
      memberNo,
      member.firstName,
      member.surname,
      similar[0].cardNo
    )

    await db
      .update(ashbourne)
      .set({ cardNo: similar[0].cardNo })
      .where(eq(ashbourne.memberNo, memberNo))
  }
}
