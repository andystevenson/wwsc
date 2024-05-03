import dayjs, { Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import advancedFormat from 'dayjs/plugin/advancedFormat.js'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(advancedFormat)
dayjs.extend(customParseFormat)

export { dayjs, type Dayjs }
export const tz = 'Europe/London'
export const ukDateFormat = 'DD/MM/YYYY'
export const ukDateTimeFormat = 'DD/MM/YYYY HH:mm:ss'
export const isoDateFormat = 'YYYY-MM-DD'
export const todayUK = dayjs().tz(tz).startOf('day')
export const tomorrowUK = todayUK.add(1, 'day')
export const yesterdayUK = todayUK.subtract(1, 'day')
export const today = dayjs().utc().startOf('day')
export const tomorrow = today.add(1, 'day')
export const yesterday = today.subtract(1, 'day')
export const year = today.year()

export const date = dayjs

export const lastOctoberUK =
  todayUK.month() >= 9
    ? todayUK.month(9).date(1)
    : todayUK
        .year(year - 1)
        .month(9)
        .date(1)

export const lastOctober =
  today.month() >= 9
    ? today.month(9).date(1)
    : today
        .year(year - 1)
        .month(9)
        .date(1)

export const sortAscending = (a: Dayjs, b: Dayjs) => {
  return a.valueOf() - b.valueOf()
}

export const sortDescending = (a: Dayjs, b: Dayjs) => {
  return b.valueOf() - a.valueOf()
}

export const nextDay = (dayOfWeek: number, start = today) => {
  let day = start.startOf('day')
  while (day.day() !== dayOfWeek) day = day.add(1, 'day')
  return day
}

export const DaysOfWeek = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

export const nextDayOfWeek = (day: string, start = today) =>
  nextDay(
    DaysOfWeek.findIndex((weekday) => day.toLowerCase() === weekday),
    start,
  )

export const nextSunday = (start = today) => nextDay(0, start)
export const nextMonday = (start = today) => nextDay(1, start)
export const nextTuesday = (start = today) => nextDay(2, start)
export const nextWednesday = (start = today) => nextDay(3, start)
export const nextThursday = (start = today) => nextDay(4, start)
export const nextFriday = (start = today) => nextDay(5, start)
export const nextSaturday = (start = today) => nextDay(6, start)

// utilities
export const ordinalDate = (date: Dayjs) => date.format('dddd, Do MMMM, YYYY')
export const ordinalDateTime = (date: Dayjs) =>
  date.format('dddd, Do MMMM, YYYY HH:mm:ss')

export const nearestDay = (...days: number[]) => {
  const nextDays = days.map((day) => nextDay(day)).sort(sortAscending)
  return nextDays
}

export const nearestDayOfWeek = (...days: string[]) => {
  const nextDaysOfWeek = days
    .map((day) => nextDayOfWeek(day))
    .sort(sortAscending)
  return nextDaysOfWeek
}

type DateRange = {
  from: Dayjs
  to: Dayjs
}

export const dateRange = (range: string): DateRange => {
  let from = date()
  let to = date()

  let candidate = range

  const singleDate = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/
  if (singleDate.test(range)) {
    from = date(range, ukDateFormat).startOf('day')
    to = from.add(1, 'day')
    candidate = 'regex'
  }

  const doubleDate =
    /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(\d{4})-(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/

  if (doubleDate.test(range)) {
    const [start, end] = range.split('-')
    from = date(start, ukDateFormat).startOf('day')
    to = date(end, ukDateFormat).add(1, 'day').startOf('day')
    candidate = 'regex'
  }

  switch (candidate) {
    case 'today':
      from = from.startOf('day')
      break

    case 'yesterday':
      from = from.startOf('day').subtract(1, 'day')
      to = from.endOf('day')
      break

    case 'week':
      // dayjs treats 'Sunday' as start of the week!
      from = from.startOf('week').add(1, 'day')
      break

    case 'month':
      from = from.startOf('month')
      break

    case 'year':
      from = from.startOf('year')
      break

    case 'financial-year':
      from = lastOctoberUK
      break

    case 'regex':
      // handled above
      break

    default:
      return dateRange('today')
  }

  return { from, to }
}
