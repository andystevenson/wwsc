import { dayjs } from '@wwsc/lib-dates'
import { SelectShift } from '../db/db'

type ShiftSummary = {
  name: string
  shifts: number
  normal: number
  supervisor: number
  breaks: number
  total: number
}

function shiftSummary(shifts: SelectShift[]) {
  let summaries: ShiftSummary[] = []

  const find = (shift: SelectShift) =>
    summaries.find((s) => s.name === shift.username)

  const add = (shift: SelectShift) => {
    let summary = find(shift)
    if (!summary) {
      summary = {
        name: shift.username,
        shifts: 0,
        normal: 0,
        supervisor: 0,
        breaks: 0,
        total: 0,
      }
      summaries.push(summary)
    }
    summary.shifts++
    let start = dayjs(shift.start)
    let end = dayjs(shift.end)
    let diff = end.diff(start, 'minutes')
    // calculate breaks
    let threshold = 4 * 60 + 30 // 4 hours 30 minutes
    let breakTime = diff > threshold && shift.nobreaks === false ? 30 : 0
    summary.breaks += breakTime

    diff -= breakTime
    shift.supervisor ? (summary.supervisor += diff) : (summary.normal += diff)
    summary.total += diff
  }

  for (let shift of shifts) {
    add(shift)
  }

  return summaries.sort((a, b) => a.name.localeCompare(b.name))
}

export { shiftSummary }
