import { SelectShift } from '../db/db'

const format = (minutes: number) => {
  let hours = Math.floor(minutes / 60)
  let mins = minutes % 60
  let pHours = hours < 10 ? `0${hours}` : hours
  let pMins = mins < 10 ? `0${mins}` : mins
  return `${pHours}:${pMins}`
}

import { shiftSummary } from './shiftSummary'
function shiftSummaryHTML(shifts: SelectShift[]) {
  let summaries = shiftSummary(shifts)
  let body = summaries
    .map((summary) => {
      let { name, shifts, normal, supervisor, breaks, total } = summary
      let normalHours = Math.floor(normal / 60) + (normal % 60) / 60
      let supervisorHours = Math.floor(supervisor / 60) + (supervisor % 60) / 60
      let breakHours = Math.floor(breaks / 60) + (breaks % 60) / 60
      let totalHours = Math.floor(total / 60) + (total % 60) / 60
      return `
    <tr>
      <td>${name}</td>
      <td>${shifts}</td>
      <td>${normalHours.toFixed(2)}</td>
      <td>${supervisorHours.toFixed(2)}</td>
      <td>${breakHours.toFixed(2)}</td>
      <td>${totalHours.toFixed(2)} (${format(total)})</td>
    </tr>
  `
    })
    .join('')

  let html = `
    <table>
      <thead>
        <tr>
          <th>employee</th>
          <th>shifts</th>
          <th>normal</th>
          <th>supervisor</th>
          <th>breaks</th>
          <th>total (hh:mm)</th>
        </tr>
      </thead>
      <tbody>
        ${body}
      </tbody>
    </table>`

  return html
}

export { shiftSummaryHTML }
