import { faker as F } from '@faker-js/faker'
import { dayjs, Dayjs } from '@wwsc/lib-dates'
import { useId } from 'hono/jsx'

F.seed(123)

function createShiftHistory(from: Dayjs) {
  const start = from.startOf('day')
  const end = from.endOf('day')
  const shiftStart = dayjs(
    F.date.between({ from: start.toDate(), to: end.toDate() }),
  )

  let max = Math.round(60 * 20)
  const shiftEnd = shiftStart.add(F.number.int({ min: 1, max }), 'minutes')
  return {
    id: F.string.uuid(),
    uid: F.string.uuid(),
    username: F.person.fullName(),
    day: shiftStart.format('dddd'),
    start: shiftStart.format('YYYY-MM-DDTHH:mm'),
    end: shiftEnd.format('YYYY-MM-DDTHH:mm'),
    duration: dayjs
      // @ts-ignore
      .duration(shiftEnd.diff(shiftStart, 'minutes'))
      .format('HH:mm:ss'),
    nobreaks: F.datatype.boolean(Math.random()),
    supervisor: F.datatype.boolean(Math.random()),
    notes: F.lorem.sentence(),
    approved: F.datatype.boolean(Math.random()),
    by: F.person.fullName(),
    clockedout: F.helpers.arrayElement(['no', 'user', 'auto', 'superuser']),
  }
}

function dayShiftHistory(date: Dayjs) {
  let history = []
  let max = F.number.int({ min: 2, max: 10 })
  let nStaff = F.number.int({ min: 1, max })
  for (let j = 0; j < nStaff; j++) {
    history.push(createShiftHistory(date))
  }
  return history
}

function todayHistory() {
  let todayHistory = [createShiftHistory(dayjs())]
  if (Math.random() > 0.5) {
    todayHistory.push(createShiftHistory(dayjs()))
  }
  return todayHistory
}

function weekHistory() {
  let start = dayjs().startOf('week').add(1, 'day')

  let history = []
  for (let i = 0; i < 7; i++) {
    history.push(...dayShiftHistory(start))
    start = start.add(1, 'day')
  }
  return history
}

function fortnightHistory() {
  let start = dayjs().startOf('week').add(1, 'day').subtract(7, 'day')
  let end = dayjs().endOf('week').add(1, 'day')

  let weekHistory = []
  while (start.isBefore(end)) {
    weekHistory.push(...dayShiftHistory(start))
    start = start.add(1, 'day')
  }
  return weekHistory
}

function last7History() {
  let start = dayjs().subtract(7, 'day').startOf('day')

  let last7History = []
  for (let i = 0; i < 7; i++) {
    last7History.push(...dayShiftHistory(start))
    start = start.add(1, 'day')
  }
  return last7History
}

function last14History() {
  let start = dayjs().subtract(7, 'day').startOf('day')

  let history = []
  for (let i = 0; i < 14; i++) {
    history.push(...dayShiftHistory(start))
    start = start.add(1, 'day')
  }
  return history
}

function monthHistory() {
  let start = dayjs().startOf('month')
  let end = dayjs().endOf('month').add(1, 'day')

  let history = []
  while (start.isBefore(end)) {
    history.push(...dayShiftHistory(start))
    start = start.add(1, 'day')
  }
  return history
}

function last30History() {
  let start = dayjs().subtract(7, 'day').startOf('day')

  let history = []
  for (let i = 0; i < 30; i++) {
    history.push(...dayShiftHistory(start))
    start = start.add(1, 'day')
  }
  return history
}

function yearHistory() {
  let start = dayjs().startOf('year')
  let end = dayjs().endOf('year').add(1, 'day')

  let history = []
  while (start.isBefore(end)) {
    history.push(...dayShiftHistory(start))
    start = start.add(1, 'day')
  }
  return history
}

export {
  createShiftHistory,
  dayShiftHistory,
  todayHistory,
  weekHistory,
  fortnightHistory,
  last7History,
  last14History,
  monthHistory,
  last30History,
  yearHistory,
}
