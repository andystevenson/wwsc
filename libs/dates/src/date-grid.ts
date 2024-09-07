import { dayjs, type Dayjs } from './base'

// a month grid is a 7x6 grid of days
function monthGrid(start: Dayjs | string) {
  let startOfMonth =
    typeof start === 'string'
      ? dayjs(start).startOf('month')
      : start.startOf('month')

  let day = startOfMonth.day()
  let from =
    day === 1
      ? startOfMonth
      : startOfMonth.subtract(day ? day - 1 : day + 6, 'day')

  let to = from.add(7 * 6, 'days')
  let grid: Dayjs[] = []

  while (from.isBefore(to)) {
    grid.push(from)
    from = from.add(1, 'day')
  }

  return grid
}

function yearGrid(year: number | string | Dayjs) {
  let startOfYear =
    typeof year === 'number'
      ? dayjs(`${year}`).startOf('year')
      : typeof year === 'string'
      ? dayjs(year).startOf('year')
      : year.startOf('year')

  let start = startOfYear
  let end = startOfYear.add(1, 'year')
  let grid: Record<string, Dayjs[]> = {}
  while (start.isBefore(end)) {
    let month = monthGrid(start)
    console.log(start.format('MMMM'))
    grid[start.format('YYYY-MM')] = month
    start = start.add(1, 'month')
  }
  return grid
}

type YearGrid = ReturnType<typeof yearGrid>
type MonthGrid = ReturnType<typeof monthGrid>

function printMonthGrid(month: MonthGrid) {
  for (let week = 0; week < 6; week++) {
    let weekdays: string[] = []
    for (let day = 0; day < 7; day++) {
      weekdays.push(month[week * 7 + day].format('YYYY-MM-DD'))
    }
    console.log(weekdays.join(' '))
  }
}

function printYearGrid(year: YearGrid) {
  for (let month in year) {
    console.log(month)
    printMonthGrid(year[month])
  }
}

function main() {
  if (process.argv.length < 3) {
    console.error('Usage: date-grid <date>')
    process.exit(1)
  }

  printYearGrid(yearGrid(process.argv[2]))
}

export { monthGrid, yearGrid, printMonthGrid, printYearGrid }
