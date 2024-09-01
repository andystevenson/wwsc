dayjs.extend(window.dayjs_plugin_advancedFormat)
dayjs.extend(window.dayjs_plugin_duration)
dayjs.extend(window.dayjs_plugin_relativeTime)

const clockin = document.querySelector('.clockin')
const clockout = document.querySelector('.clockout')
const now = document.querySelector('.now')
const shift = document.querySelector('.shift')
const history = document.querySelector('.history')
const errors = document.querySelector('.errors')
const cancelErrors = document.querySelector('.errors .cancel')
const confirmation = document.querySelector('.confirmation')
const cancelConfirmation = document.querySelector('.confirmation .cancel')
const confirm = document.querySelector('.confirmation .confirm')
const holidaysReport = document.querySelector('.reports .holidays')

document.addEventListener('keydown', (e) => {
  console.log('key', e.key)
  if (e.key === 'Escape') {
    closeDetails()
  }

  if (e.key === 'Backspace' && e.metaKey) {
    const shift = document.querySelector('li:hover')
    if (!shift) return
    clockSomeoneOut(shift)
  }
})

clockin?.addEventListener('click', async (e) => {
  let uid = clockin.dataset.uid
  let start = dayjs().format('YYYY-MM-DDTHH:mm')
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
    body: JSON.stringify({ uid, start }),
  }

  const response = await fetch('/shift/clockin', request)
  if (response.ok) {
    clockin.disabled = true
    clockin.classList.remove('active')
    shift.classList.add('active')

    let { id, start } = await response.json()
    start = dayjs(start)
    clockin.dataset.id = id
    let startElement = shift.querySelector('.start')
    startElement.textContent = start.format('HH:mm')
    startElement.setAttribute('datetime', start.format('YYYY-MM-DDTHH:mm'))
  }
})

let shiftInterval = setInterval(trackShift, 1000)

clockout?.addEventListener('click', async () => {
  const { id, uid } = clockin.dataset
  const end = dayjs().format('YYYY-MM-DDTHH:mm')
  const start = shift.querySelector('.start').dateTime
  const duration = shift.querySelector('.duration').dateTime
  const supervisor = shift.querySelector('[name=supervisor]').checked
  const nobreaks = shift.querySelector('[name=nobreaks]').checked
  const notes = shift.querySelector('[name=notes]').value

  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
    body: JSON.stringify({
      id,
      uid,
      start,
      end,
      duration,
      supervisor,
      nobreaks,
      notes,
      clockedout: 'user',
    }),
  }

  const response = await fetch('/shift/clockout', request)
  if (response.ok) {
    clearInterval(shiftInterval)
    let { start, end } = await response.json()
    start = dayjs(start)
    end = dayjs(end)
    let endElement = shift.querySelector('.end')
    let endLabelElement = shift.querySelector('.end-label')
    endElement.classList.add('ended')
    endLabelElement.classList.add('ended')
    endElement.textContent = end.format('HH:mm')

    let itsTheNextDay = end.isAfter(start.endOf('day'))
    if (itsTheNextDay) {
      const startElement = shift.querySelector('.start')
      startElement.textContent = start.format('dddd Do, HH:mm')
      endElement.textContent = end.format('dddd Do, HH:mm')
      shift.classList.add('next-day')
    }

    shift.classList.add('ended')
    clockout.classList.add('ended')
  }
})

function trackShift() {
  if (!shift) {
    clearInterval(shiftInterval)
    return
  }

  if (shift.style.display === 'none') {
    return
  }

  const now = dayjs()
  const startElement = shift.querySelector('.start')
  const start = dayjs(startElement.getAttribute('datetime'))

  if (!start.isValid()) {
    return
  }
  const itsTheNextDay = now.isAfter(start.endOf('day'))

  if (itsTheNextDay) {
    startElement.textContent = start.format('dddd Do, HH:mm')
  }

  const diff = now.diff(start, 'second')
  const duration = dayjs.duration(diff, 'second')
  const durationElement = shift.querySelector('.duration')
  const textContent = duration.format('HH:mm:ss')
  durationElement.textContent = textContent
  durationElement.setAttribute('datetime', textContent)
}

let trackClockedInShiftsInterval = setInterval(trackClockedInShifts, 1000)
function trackClockedInShifts() {
  const liveShifts = document.querySelectorAll('.history .clockedin')
  liveShifts.forEach((clockedin) => {
    let shift = clockedin.closest('li')
    let startElement = shift.querySelector('[name=start]')
    let endElement = shift.querySelector('[name=end]')
    let startTime = dayjs(startElement.value)
    let endTime = dayjs()
    let diff = endTime.diff(startTime, 'second')
    let duration = dayjs.duration(diff, 'second')
    if (duration.days() > 0) {
      // will automatically be clocked out
      shift.querySelector('[name="notes"]').value = 'auto clocked out'
      return
    }
    endElement.value = endTime.format('YYYY-MM-DDTHH:mm')
    let durationElement = shift.querySelector('[name=duration]')
    durationElement.value = duration.format('HH:mm:ss')
  })
}

history?.addEventListener('change', async (e) => {
  if (e.target.name === 'allapproved') {
    allApproved(e.target)
    return
  }

  const shift = e.target.closest('li')
  shiftUpdated(shift)
  switch (e.target.name) {
    case 'start':
      timeUpdated(shift)
      break
    case 'end':
      timeUpdated(shift)
      break
    case 'duration':
      durationUpdate(shift)
      break
  }
})

function timeUpdated(shiftElement) {
  const start = shiftElement.querySelector('[name=start]')
  const end = shiftElement.querySelector('[name=end]')
  const duration = shiftElement.querySelector('[name=duration]')

  const min = dayjs(start.min)

  let startTime = dayjs(start.value)

  if (!startTime.isSame(min, 'day')) {
    raiseError('Cannot change shift start date!')
    startTime = dayjs(start.dataset.value)
    start.value = start.dataset.value
  }

  let endTime = dayjs(end.value)

  if (!endTime.isAfter(startTime, 'minute')) {
    endTime = startTime.add(1, 'minute')
    duration.value = '00:01'
    end.value = endTime.format('YYYY-MM-DDTHH:mm')
  }

  let durationTime = endTime.diff(startTime, 'millisecond')

  let maxShiftDuration = 24 * 60 * 60 * 1000 - 60 * 1000
  if (durationTime > maxShiftDuration) {
    duration.value = '23:59'
    durationTime = maxShiftDuration
    endTime = startTime.add(durationTime, 'millisecond')
    end.value = endTime.format('YYYY-MM-DDTHH:mm')
  } else {
    duration.value = dayjs.duration(durationTime).format('HH:mm')
  }

  const tenHours = 10 * 60 * 60 * 1000
  durationTime > tenHours
    ? duration.parentElement.classList.add('longshift')
    : duration.parentElement.classList.remove('longshift')
  // console.log('validateUpdate', start.value, end.value, duration.value)
}

function durationUpdate(shiftElement) {
  const start = shiftElement.querySelector('[name=start]')
  const end = shiftElement.querySelector('[name=end]')
  const duration = shiftElement.querySelector('[name=duration]')

  const min = dayjs(start.min)

  let startTime = dayjs(start.value)
  let durationTime = duration.valueAsNumber
  let endTime = startTime.add(durationTime, 'millisecond')

  if (!startTime.isSame(min, 'day')) {
    raiseError('Cannot change shift start date!')
    startTime = dayjs(start.dataset.value)
    start.value = start.dataset.value
  }

  if (!endTime.isAfter(startTime, 'minute')) {
    // raiseError('Shift end time must be after start time!')
    // instead of an dialog... silently correct the end time
    endTime = startTime.add(1, 'minute')
    duration.value = '00:01'
  }
  end.value = endTime.format('YYYY-MM-DDTHH:mm')

  const tenHours = 10 * 60 * 60 * 1000
  durationTime > tenHours
    ? duration.parentElement.classList.add('longshift')
    : duration.parentElement.classList.remove('longshift')
  // console.log('validateUpdate', start.value, end.value, duration.value)
}

function isSuperuser() {
  return document.querySelector('.page.superuser') !== null
}

function clockSomeoneOut(shift) {
  if (!isSuperuser()) {
    return
  }
  const { id } = clockin.dataset
  const shiftId = shift.querySelector('[name=id]').value
  if (id === shiftId) {
    raiseError('Cannot clock yourself out!')
    return
  }

  shiftUpdated(shift)
  const name = shift.querySelector('.username').textContent
  console.log('clockSomeoneOut', shift)
  const details = shift.closest('details')
  const update = details.querySelector('.update')
  update?.classList.add('active')
  cancelConfirmation.textContent = 'cancel'
  cancelConfirmation.classList.remove('exit')
  confirm.style.display = 'block'
  confirmation.firstElementChild.textContent = `Are you sure you want to clock out ${name}?`
  confirmation.showModal()
}

history?.addEventListener('click', async (e) => {
  let update = e.target.closest('button')
  if (update?.classList.contains('update')) {
    update.classList.add('active')
    const updated = selectUpdated()
    if (updated.length === 0) {
      errors.firstElementChild.textContent = `Nothing was updated!`
      errors.showModal()
      return
    }

    let n = `${updated.length} shifts`
    if (updated.length === 1) {
      n = 'shift'
    }

    cancelConfirmation.textContent = 'cancel'
    cancelConfirmation.classList.remove('exit')
    confirm.style.display = 'block'
    confirmation.firstElementChild.textContent = `Are you sure you want to update the selected ${n}?`
    confirmation.showModal()
  }
})

function shiftUpdated(shiftElement) {
  shiftElement.classList.add('updated')
}

function raiseError(message) {
  errors.firstElementChild.textContent = message
  errors.showModal()
}

function allApproved(allApprovedElement) {
  const scope = allApprovedElement.closest('details')
  const approved = scope.querySelectorAll('[name=approved]')
  approved.forEach((a) => {
    if (a.checked) {
      return
    }
    a.checked = true
    let li = a.closest('li')
    li?.classList.add('updated')
  })
}

cancelErrors?.addEventListener('click', () => {
  errors.close()
})

cancelConfirmation?.addEventListener('click', () => {
  const actives = history.querySelectorAll('.update.active')
  actives.forEach((a) => {
    a.classList.remove('active')
  })
  confirmation.close()
})

function selectUpdated() {
  const update = history.querySelector('.update.active')
  const scope = update?.closest('details')
  const updated = Array.from(scope?.querySelectorAll('.updated'))
  return updated
}

function selectShift(shift) {
  let id = shift.querySelector('[name=id]').value
  let start = shift.querySelector('[name=start]').value
  let end = shift.querySelector('[name=end]').value
  let duration = shift.querySelector('[name=duration]').value
  let supervisor = shift.querySelector('[name=supervisor]').checked
  let nobreaks = shift.querySelector('[name=nobreaks]').checked
  let notes = shift.querySelector('[name=notes]').value
  let approved = shift.querySelector('[name=approved]')?.checked
  return { id, start, end, duration, supervisor, nobreaks, notes, approved }
}

confirm?.addEventListener('click', async () => {
  let updated = selectUpdated()
  if (updated.length === 0) {
    closeDetails()
    return
  }

  let updates = []
  let deletes = []
  for (let shift of updated) {
    let id = shift.querySelector('[name=id]').value
    let deleteme = shift.querySelector('[name=deleteme]')?.checked
    if (deleteme) {
      deletes.push(id)
      continue
    }

    const update = {
      ...selectShift(shift),
      clockout: 'supervisor',
    }
    updates.push(update)
  }

  await updateShifts(updates)
  let background = setTimeout(async () => {
    await deleteShifts(deletes), clearTimeout(background)
  }, 2000)

  closeDetails()
})

function closeDetails() {
  let details = document.querySelectorAll('details[open]')
  details.forEach((d) => {
    d.removeAttribute('open')
  })
}

async function updateShifts(updates) {
  if (updates.length === 0) {
    return
  }
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
    body: JSON.stringify(updates),
  }

  const response = await fetch('/shift/approve', request)
  if (!response.ok) {
    confirmation.close()
    raiseError('update failed, please logout!')
    return
  }
  // update was successful
  confirmation.firstElementChild.textContent = `Updated ${updates.length} ${
    updates.length > 1 ? 'shifts' : 'shift'
  } successfully!`
  cancelConfirmation.textContent = 'exit'
  cancelConfirmation.classList.add('exit')
  confirm.style.display = 'none'
}

async function deleteShifts(ids) {
  if (ids.length === 0) {
    return
  }

  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
    body: JSON.stringify(ids),
  }

  const response = await fetch('/shift/deletes', request)
  if (!response.ok) {
    confirmation.close()
    raiseError('delete failed, please logout!')
    return
  }
  // delete was successful
  confirmation.firstElementChild.textContent = `Deleted ${ids.length} ${
    ids.length > 1 ? 'shifts' : 'shift'
  } successfully!`
  cancelConfirmation.textContent = 'exit'
  cancelConfirmation.classList.add('exit')
  confirm.style.display = 'none'
}

holidaysReport?.addEventListener('toggle', async (e) => {
  if (!e.target.open) {
    return
  }
  await getHolidaysReport()
})

async function getHolidaysReport() {
  let zerohours = holidaysReport.querySelector('.zerohours')
  let permanent = holidaysReport.querySelector('.permanent')
  if (!zerohours || !permanent) {
    console.error('missing elements!!!')
    return
  }

  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  }

  const response = await fetch('/holidays/report', request)
  if (!response.ok) {
    return
  }

  let { perms, zeros } = await response.json()
  console.log({ perms, zeros })

  permanent.innerHTML = ''
  let pgrid = new gridjs.Grid({
    language: {
      search: {
        placeholder: '🔍 Search...',
      },
    },
    search: true,
    data: perms,
  })

  let el = document.createElement('div')
  el.classList.add('newgrid')
  permanent.appendChild(el)
  pgrid.render(el)

  zeros.innerHTML = ''
  let zgrid = new gridjs.Grid({
    language: {
      search: {
        placeholder: '🔍 Search...',
      },
    },
    search: true,
    data: zeros,
  })

  let zel = document.createElement('div')
  zel.classList.add('newgrid')
  zerohours.appendChild(zel)
  zgrid.render(zel)
}
