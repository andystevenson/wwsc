import { dayjs } from '@wwsc/lib-dates'
import { db, ashbourne, eq } from '../src/db/db'

const forever = dayjs('1900-01-01')
async function main() {
  let liveButExpired = await db
    .select()
    .from(ashbourne)
    .where(eq(ashbourne.status, 'Live'))

  let today = dayjs()
  liveButExpired = liveButExpired.filter((member) => {
    const { memberNo, firstName, surname, expireDate } = member
    let eDate = dayjs(expireDate)
    if (!eDate.isSame(forever, 'date') && eDate.isBefore(today)) {
      console.log(
        `${memberNo} ${firstName} ${surname} expired on ${eDate.format('YYYY-MM-DD')}`
      )
      return true
    }
  })
  console.log(liveButExpired.length)
}

await main()
