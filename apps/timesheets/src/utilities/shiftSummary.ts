import { dayjs } from '@wwsc/lib-dates'
import { SelectShift } from '../db/db'

type ShiftSummary = {
  name: string
  shifts: number
  normal: number
  supervisor: number
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
        total: 0,
      }
      summaries.push(summary)
    }
    summary.shifts++
    let start = dayjs(shift.start)
    let end = dayjs(shift.end)
    let diff = end.diff(start, 'minutes')
    shift.supervisor ? (summary.supervisor += diff) : (summary.normal += diff)
    summary.total += diff
  }

  for (let shift of shifts) {
    add(shift)
  }

  return summaries.sort((a, b) => a.name.localeCompare(b.name))
}

export { shiftSummary }
