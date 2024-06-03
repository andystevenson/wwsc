import { dayjs } from '@wwsc/lib-dates'
import { postDailyTakings } from './postDailyTakings'

type DailyTakings = Awaited<ReturnType<typeof postDailyTakings>>
type MonthlyTakings = Record<string, DailyTakings>

export const postMonthlyTakings = async (bearer: string, date: string) => {
  const monthly: MonthlyTakings = {}
  const start = dayjs(date).startOf('month')
  const end = start.add(1, 'month')
  let from = start

  while (from.isBefore(end)) {
    let day = from.format('YYYY-MM-DD')
    console.log(`Posting daily takings for ${day}`)
    let result = await postDailyTakings(bearer, day)
    monthly[day] = result
    from = from.add(1, 'day')
  }
  return monthly
}
