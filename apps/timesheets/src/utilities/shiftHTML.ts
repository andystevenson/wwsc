import { Shift } from '../db/Types'
import { dayjs } from '@wwsc/lib-dates'

function shiftHTML(privileges: string, shift: Shift) {
  const superuser = privileges === 'superuser'
  const admin = privileges === 'admin'
  const editor = superuser || admin
  let clockedout = shift.end ? true : false
  let liClass = clockedout ? `${privileges}` : `${privileges} clockedin`
  let liTitle = clockedout ? '' : 'title="clocked in, active shift"'
  let endClass = clockedout ? 'end' : 'end clockedin'
  let readonly = editor && clockedout ? '' : 'readonly disabled'
  let approved =
    editor && clockedout
      ? `
      <label class='approved'>
        <span>approved</span>
        <input type="checkbox"  ${shift.approved ? 'checked' : ''}
          name="approved"/>
      </label>`
      : ''

  let allowDelete =
    editor && clockedout
      ? `
      <label class='deleteme'>
        <span>delete</span>
        <input type="checkbox" name="deleteme"/>
      </label>`
      : ''
  let startDay = dayjs(shift.start)
  let startDayMin = startDay.startOf('day').format('YYYY-MM-DDTHH:mm')
  let startDayMax = startDay.endOf('day').format('YYYY-MM-DDTHH:mm')

  let duration = ''
  if (shift.end) {
    let start = dayjs(shift.start)
    let end = dayjs(shift.end)
    let diff = end.diff(start, 'minutes')
    // @ts-ignore
    duration = dayjs.duration(diff, 'minutes').format('HH:mm')
  }

  return `
  <li class="${liClass}" ${liTitle}>
    <input type="hidden" name="id" value="${shift.id}" />
    <p class="username">${shift.username}</p>
    <p class="day">${shift.day}</p>
    <label class="start">
      <span>start</span>
      <input type="datetime-local" name="start" 
        value="${shift.start}"
        data-value="${shift.start}"
        min=${startDayMin} max=${startDayMax} ${readonly} />
    </label>
    <label class="${endClass}">
      <span>end</span>
      <input type="datetime-local" name="end" 
        value="${shift.end ? shift.end : ''}"
        data-value="${shift.end ? shift.end : ''}" ${readonly} />
    </label>
    <label class="duration">
      <span>duration</span>
      <p>${duration}</p>
    </label>
    <label class="nobreaks">
      <span>no breaks</span>
      <input type="checkbox" name="nobreaks" 
        ${shift.nobreaks ? 'checked' : ''} ${readonly} />
    </label>
    <label class="supervisor">
      <span>supervisor</span>
      <input type="checkbox" name="supervisor" 
        ${shift.supervisor ? 'checked' : ''} ${readonly} />
    </label>
    <label class="shiftnotes">
      <span>notes</span>
      <input type="text" name="notes" 
        value="${shift.notes ? shift.notes : ''}" ${readonly} />
    </label>
    ${approved}
    ${allowDelete}
  </li>
    `
}

function summaryHTML(privileges: string, shifts: Shift[]) {
  const superuser = privileges === 'superuser'
  const admin = privileges === 'admin'
  const editor = superuser || admin
  let staff = shifts.reduce((acc, shift) => {
    acc.add(shift.username)
    return acc
  }, new Set<string>())

  let count = shifts.length
  // @ts-ignore
  let totalMinutes = shifts.reduce((acc, shift) => {
    // @ts-ignore
    if (!shift.end) return acc

    let start = dayjs(shift.start)
    let end = dayjs(shift.end)
    let diff = end.diff(start, 'minutes')
    return acc + diff
  }, 0)

  let hours = Math.floor(totalMinutes / 60)
  let minutes = totalMinutes % 60

  let duration =
    hours && minutes
      ? `<b>${hours}</b> hours <b>${minutes}</b> minutes`
      : hours
      ? `<b>${hours}</b> hours`
      : `<b>${minutes}</b> minutes`

  let size = editor
    ? `
      <label class="staff">
        <span>staff</span>
        <p>${staff.size}</p>
      </label>`
    : ''

  let approved = editor
    ? `  
      <label class="approved">
        <span>all approved</span>
        <input type="checkbox" name="allapproved" />
      </label>
      <button class="update">update</button>`
    : ''

  let summary = `
    <section class="summary">
      ${size}
      <label class="shifts">
        <span>shifts</span>
        <p>${count}</p>
      </label>
      <label class="duration">
        <span>duration</span>
        <p>${duration}</p>
      </label>
      ${approved}
    </section>`

  return summary
}

function longerHTML(privileges: string, shifts: Shift[]) {
  let summary = summaryHTML(privileges, shifts)
  let html = shifts.map((shift) => shiftHTML(privileges, shift)).join('')
  return `${summary}<ul>${html}</ul>`
}

export { shiftHTML, longerHTML }
