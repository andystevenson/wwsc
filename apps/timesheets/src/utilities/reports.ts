import { dayjs } from '@wwsc/lib-dates'
type Fortnight = {
  start: string // YYYY-MM-DD
  end: string // YYYY-MM-DD
}

function paydays() {
  let fortnights: Fortnight[] = []
  let date = dayjs('2024-01-14') // first payday
  while (date.year() < 2027) {
    let start = date.subtract(13, 'day').format('YYYY-MM-DD')
    let end = date.format('YYYY-MM-DD')
    fortnights.push({ start, end })
    date = date.add(14, 'day')
  }
  return fortnights
}

let Paydays = paydays()

function findFortnight(date: string) {
  return Paydays.find((fortnight) => {
    return date >= fortnight.start && date <= fortnight.end
  })
}

function allFortnights(earliest: string) {
  let start = dayjs(earliest)
  let tomorrow = dayjs().startOf('day').add(1, 'day')
  let fortnights: Fortnight[] = []
  let unique = new Set()
  while (start.isBefore(tomorrow)) {
    let fortnight = findFortnight(start.format('YYYY-MM-DD'))
    if (!fortnight) continue
    if (!unique.has(fortnight.start)) {
      fortnights.push(fortnight)
      unique.add(fortnight.start)
    }
    start = start.add(1, 'day')
  }
  return fortnights.toReversed() // most recent first
}

function allMonths(earliest: string) {
  let start = dayjs(earliest)
  let nextMonth = dayjs().startOf('month').add(1, 'month')
  let months: string[] = []
  let unique = new Set()
  while (start.isBefore(nextMonth)) {
    let month = start.format('YYYY-MM')
    if (!unique.has(month)) {
      months.push(month)
      unique.add(month)
    }
    start = start.add(1, 'month')
  }
  return months.toReversed() // most recent first
}

export { allFortnights, allMonths }
