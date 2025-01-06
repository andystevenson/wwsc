import { dayjs } from '@wwsc/lib-dates'
import { db, ashbourne, eq } from '../src/db/db'

async function main() {
  let liveButNoEmail = await db
    .select({
      memberNo: ashbourne.memberNo,
      firstName: ashbourne.firstName,
      surname: ashbourne.surname,
      email: ashbourne.email
    })
    .from(ashbourne)
    .where(eq(ashbourne.status, 'Live'))

  let today = dayjs()
  liveButNoEmail = liveButNoEmail.filter((member) => {
    const { memberNo, firstName, surname, email } = member
    if (!email) {
      console.log(`${memberNo} ${firstName} ${surname} no email`)
      return true
    }
    return false
  })
  console.log(liveButNoEmail.length)
}

await main()
