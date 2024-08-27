import { argv } from 'bun'
import { and, eq, gte, lt, db, holidays } from '../db/db'
import { dayjs } from '@wwsc/lib-dates'

export const isBankHoliday = async (date: string) => {
  let startOfYear = dayjs(date).startOf('year')
  let endOfYear = dayjs(date).add(1, 'year')
  if (!startOfYear.isValid() || !endOfYear.isValid()) {
    return false
  }

  let bankHolidays = await db
    .select()
    .from(holidays)
    .where(
      and(
        eq(holidays.type, 'bhol'),
        gte(holidays.date, startOfYear.format('YYYY-MM-DD')),
        lt(holidays.date, endOfYear.format('YYYY-MM-DD')),
      ),
    )

  let is = bankHolidays.find((holiday) => holiday.date === date)
  return is ? true : false
}

export default isBankHoliday

// async function main() {
//   let bhol = argv[2]
//   let is = await isBankHoliday(bhol)
//   console.log({ bhol, is })
// }

// await main()
