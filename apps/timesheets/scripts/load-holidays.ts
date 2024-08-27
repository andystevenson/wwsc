import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import { dayjs } from '@wwsc/lib-dates'
import { readFileSync, writeFileSync } from 'node:fs'
import env from '../src/utilities/env'
import { getStaff, findStaffByName, zeroHourStaff } from '../src/pos/pos'

type Holiday = {
  name: string
  date: string
  hours: string
  type: string
  notes: string
}
let holidays = parse(readFileSync('holidays.csv', 'utf8'), {
  columns: true,
  skip_empty_lines: true,
}) as Holiday[]

// holidays = holidays.sort(
//   (a, b) => a.date.localeCompare(b.date) || a.type.localeCompare(b.type),
// )

let grouped = Object.groupBy(holidays, (holiday) => holiday.name)
// console.log('grouped', grouped)
// writeFileSync('holidays2.csv', stringify(holidays, { header: true }))

async function main() {
  console.log('main')
  let allStaff = await getStaff()
  console.log('allStaff', allStaff.length)
  for (let holiday of holidays) {
    if (holiday.name === 'system') {
      continue
    }
    let staff = await findStaffByName(holiday.name, false)
    if (!staff) {
      console.error('staff not found', holiday.name)
      continue
    }
  }

  checkBfwd()
  check()
}

async function check() {
  for (let staff in grouped) {
    if (staff === 'system') continue
    let holidays = grouped[staff]
    if (!holidays?.length) continue
    let name = holidays[0].name
    let employee = await findStaffByName(name)
    if (!employee) {
      console.error('employee not found', name)
      continue
    }
    if (employee.isPermanent) {
      let calculated = permanent(holidays)
      console.log({ staff, calculated })
    }

    if (employee.isZeroHours) {
      let calculated = zerohours(holidays)
      console.log({ staff, calculated })
    }
  }
}

function checkBfwd() {
  for (let staff in grouped) {
    if (staff === 'system') continue
    let holidays = grouped[staff]
    if (!holidays?.length) continue
    let type = holidays[0].type
    if (type === 'bfwd') continue
    console.log({ staff, type })
  }
}

function permanent(holidays: Holiday[]) {
  let accrued = 0
  let taken = 0
  let contract = 20
  let allowed = 0
  let bfwd = 0
  let start = ''
  let who = ''
  for (let holiday of holidays) {
    if (holiday.type === 'bfwd') {
      who = holiday.name
      start = holiday.date
      let startDate = dayjs(start)
      let jan1 = startDate.startOf('year')
      let endOfYear = startDate.endOf('year').add(1, 'day')
      let days = endOfYear.diff(startDate, 'days')
      let fullYear = endOfYear.diff(jan1, 'days')
      allowed = Math.ceil((days / fullYear) * contract) * 8
      accrued = 0
      bfwd = +holiday.hours
    }

    if (holiday.type === 'acc') {
      accrued += +holiday.hours
    }

    if (holiday.type === 'taken') {
      taken += +holiday.hours
    }
  }
  let remaining = bfwd + allowed + accrued - taken

  return {
    who,
    start,
    contract: +(allowed / 8).toFixed(2),
    bfwd: +(bfwd / 8).toFixed(2),
    accrued: +(accrued / 8).toFixed(2),
    taken: +(taken / 8).toFixed(2),
    remaining: +(remaining / 8).toFixed(2),
  }
}

function zerohours(holidays: Holiday[]) {
  let accrued = 0
  let taken = 0
  let paid = 0
  let bfwd = 0
  let start = ''
  let who = ''
  for (let holiday of holidays) {
    let { type, hours } = holiday
    switch (type) {
      case 'bfwd':
        who = holiday.name
        start = holiday.date
        bfwd = +hours
        break
      case 'acc':
        accrued += +hours
        break
      case 'taken':
        taken += +hours
        break
      case 'paid':
        paid += +hours
        accrued -= +hours
        break
    }
  }

  return {
    who,
    start,
    bfwd: +bfwd.toFixed(2),
    accrued: +accrued.toFixed(2),
    paid: +paid.toFixed(2),
    total: +(bfwd + accrued + paid).toFixed(2),
    taken: +taken.toFixed(2),
    days: +(taken / 8).toFixed(2),
  }
}

await main()
