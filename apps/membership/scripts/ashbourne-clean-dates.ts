import { db, ashbourne, eq } from '../src/db/db'
import { dayjs } from '@wwsc/lib-dates'

const all = await db
  .select({
    memberNo: ashbourne.memberNo,
    firstName: ashbourne.firstName,
    surname: ashbourne.surname,
    dob: ashbourne.dob,
    lastPayDate: ashbourne.lastPayDate,
    joinedDate: ashbourne.joinedDate,
    expireDate: ashbourne.expireDate,
    reviewDate: ashbourne.reviewDate
  })
  .from(ashbourne)

let d1925 = dayjs('1925-01-01')
for (const row of all) {
  const dob = dayjs(row.dob)
  const lastPayDate = dayjs(row.lastPayDate)
  const joinedDate = dayjs(row.joinedDate)
  const expireDate = dayjs(row.expireDate)
  const reviewDate = dayjs(row.reviewDate)

  let newRow = {
    dob: dob.isValid() && dob.isAfter(d1925) ? dob.format('YYYY-MM-DD') : '',
    lastPayDate:
      lastPayDate.isValid() && lastPayDate.isAfter(d1925)
        ? lastPayDate.format('YYYY-MM-DD')
        : '',
    joinedDate:
      joinedDate.isValid() && joinedDate.isAfter(d1925)
        ? joinedDate.format('YYYY-MM-DD')
        : '',
    expireDate:
      expireDate.isValid() && expireDate.isAfter(d1925)
        ? expireDate.format('YYYY-MM-DD')
        : '',
    reviewDate:
      reviewDate.isValid() && reviewDate.isAfter(d1925)
        ? reviewDate.format('YYYY-MM-DD')
        : ''
  }
  console.log(row.firstName, row.surname, newRow)
  await db
    .update(ashbourne)
    .set(newRow)
    .where(eq(ashbourne.memberNo, row.memberNo))
}
