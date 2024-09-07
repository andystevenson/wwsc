console.log('home.js loaded')

let timespan = document.querySelector('#timespan ol')

document.addEventListener('htmx:afterSwap', (event) => {
  let elt = event.detail.elt

  let id = elt.dataset.id
  localStorage.setItem('wwsc:events:view', id)
  updateTimespan(id)

  let main = document.querySelector('main').childNodes
  for (let i = 0; i < main.length; i++) {
    if (main[i].id !== elt.id) {
      main[i].classList.remove('active')
    }
  }
  scrollIntoView(elt.id)
})

function scrollIntoView(id) {
  console.log('scrollIntoView', id)
  if (id !== 'day') {
    return
  }
  let now = new Date()
  let hours = now.getHours()

  let elt = document.getElementById(`t${hours}`)

  console.log('siv', elt, hours)
  if (elt) {
    let siv = setTimeout(() => {
      elt.scrollIntoView({ behavior: 'instant', block: 'center' })
      clearTimeout(siv)
    }, 250)
  }
}

function updateTimespan(view) {
  let isYear = /^[0-9]{4}$/.test(view)
  let isMonth = /^[0-9]{4}-[0-9]{2}$/.test(view)
  let isDay = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(view)
  let isWeek = /^w[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(view)

  let childNodes = timespan.childNodes
  for (let i = 0; i < childNodes.length; i++) {
    childNodes[i].classList.remove('active')
  }

  let yearButton = timespan.querySelector('.year')
  let monthButton = timespan.querySelector('.month')
  let dayButton = timespan.querySelector('.day')
  let weekButton = timespan.querySelector('.week')

  let target = null
  let diff = 0
  let units = 'days'

  if (isYear) {
    units = 'years'
    target = yearButton
  }

  if (isMonth) {
    units = 'months'
    target = monthButton
  }

  if (isDay) {
    units = 'days'
    target = dayButton
  }

  if (isWeek) {
    units = 'days'
    target = weekButton
  }

  let was = dayjs(target.dataset.next.replace('w', ''))
  let now = dayjs(view.replace('w', ''))
  diff = now.diff(was, units)

  let newDate = dayjs(dayButton.dataset.next).add(diff, units)
  let newView = newDate.format('YYYY-MM-DD')
  dayButton.dataset.next = newView
  dayButton.setAttribute('hx-get', '/views/day?d=' + newView)

  newView = newDate.format('YYYY-MM')
  monthButton.dataset.next = newView
  monthButton.setAttribute('hx-get', '/views/month?m=' + newView)

  newView = newDate.format('YYYY')
  yearButton.dataset.next = newView
  yearButton.setAttribute('hx-get', '/views/year?y=' + newView)

  let week = startOfWeek(newDate)

  newView = week.format('YYYY-MM-DD')
  weekButton.dataset.next = newView
  weekButton.setAttribute('hx-get', '/views/week?w=w' + newView)

  target.parentElement.classList.add('active')
  target.dataset.next = view
  htmx.process(yearButton)
  htmx.process(monthButton)
  htmx.process(dayButton)
  htmx.process(weekButton)
}

function startOfWeek(date) {
  let week =
    date.day() === 1
      ? date
      : date.day() === 0
      ? date.subtract(6, 'days')
      : date.startOf('week').add(1, 'day')
  return week
}

function gotoToday() {
  let now = dayjs()
  let current = document.querySelector('main .active')
  let span = current.id
  let view = null
  switch (span) {
    case 'day':
      view = now.format('YYYY-MM-DD')
      break
    case 'week':
      view = startOfWeek(now).format('wYYYY-MM-DD')
      break
    case 'month':
      view = now.format('YYYY-MM')
      break
    case 'year':
      view = now.format('YYYY')
      break
    default:
      return
  }
  updateTimespan(view)
  let elt = timespan.querySelector('.active button')
  console.log('gotoToday', view, elt)
  elt?.click()
}
