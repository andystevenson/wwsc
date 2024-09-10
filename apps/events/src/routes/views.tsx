import { Page } from '@wwsc/lib-hono'
import { factory } from '../hono-factory'
import { dayjs, type Dayjs, yearGrid, monthGrid } from '@wwsc/lib-dates'

const views = factory.createApp()

function classesFromDateInMonth(day: Dayjs, month: Dayjs) {
  let today = day.isSame(dayjs(), 'day') ? 'today' : ''
  let before = day.isBefore(month, 'month') ? 'before' : ''
  let after = day.isAfter(month, 'month') ? 'before' : ''
  let weekend = day.day() === 0 || day.day() === 6 ? 'weekend' : ''
  let classes = [today, before, after, weekend]
    .join(' ')
    .replaceAll(/\s+/g, ' ')
    .trim()

  return classes
}

function htmxDayProps(day: Dayjs) {
  return {
    'hx-get': '/views/day?d=' + day.format('YYYY-MM-DD'),
    'hx-target': '#day',
    'hx-swap': 'outerHTML',
  }
}

function htmxWeekProps(day: Dayjs) {
  return {
    'hx-get': '/views/week?w=w' + day.format('YYYY-MM-DD'),
    'hx-target': '#week',
    'hx-swap': 'outerHTML',
  }
}

function htmxMonthProps(day: Dayjs) {
  return {
    'hx-get': '/views/month?m=' + day.format('YYYY-MM'),
    'hx-target': '#month',
    'hx-swap': 'outerHTML',
  }
}

function htmxYearProps(day: Dayjs) {
  return {
    'hx-get': '/views/year?y=' + day.format('YYYY'),
    'hx-target': '#year',
    'hx-swap': 'outerHTML',
  }
}

views.get('/year', (c) => {
  let y = c.req.query('y')
  if (!y) {
    return c.redirect('/')
  }

  let yearDate = dayjs(y)
  let year = yearGrid(y)

  let page = (
    <section id="year" class="year active" data-id={y}>
      <header>
        <button
          class="previous plain"
          {...htmxYearProps(yearDate.subtract(1, 'year'))}
        >
          &laquo;
        </button>
        <h1>{y}</h1>
        <button
          className="next plain"
          {...htmxYearProps(yearDate.add(1, 'year'))}
        >
          &raquo;
        </button>
      </header>
      <ol>
        {Object.keys(year).map((month) => {
          let grid = year[month]
          let monthDate = dayjs(month)
          let monthName = monthDate.format('MMMM')
          return (
            <article class="year-month" id={'ym-' + month}>
              <header>
                <h2 {...htmxMonthProps(monthDate)}>{monthName}</h2>
                <ol>
                  <li>
                    <span>M</span>
                  </li>
                  <li>
                    <span>T</span>
                  </li>
                  <li>
                    <span>W</span>
                  </li>
                  <li>
                    <span>T</span>
                  </li>
                  <li>
                    <span>F</span>
                  </li>
                  <li>
                    <span>S</span>
                  </li>
                  <li>
                    <span>S</span>
                  </li>
                </ol>
              </header>
              <ol>
                {grid.map((day) => {
                  let id = `ymd-${day.format('YYYY-MM-DD')}`

                  // random for now
                  let r = Math.random()
                  let bookings =
                    r > 0.75 ? 'bookings' : r > 0.5 ? 'enquiries' : ''
                  let classes =
                    classesFromDateInMonth(day, dayjs(month)) + ' ' + bookings

                  return (
                    <li class={classes} id={id} {...htmxDayProps(day)}>
                      <span>{day.date()}</span>
                    </li>
                  )
                })}
              </ol>
            </article>
          )
        })}
      </ol>
    </section>
  )
  return c.html(page)
})

views.get('/month', (c) => {
  let m = c.req.query('m')
  if (!m) {
    return c.redirect('/')
  }

  let grid = monthGrid(m)
  let month = dayjs(m)
  let monthName = dayjs(m).format('MMMM')
  let year = dayjs(m).format('YYYY')
  let nextMonth = dayjs(m).add(1, 'month')
  let previousMonth = dayjs(m).subtract(1, 'month')

  let page = (
    <section id="month" class="month active" data-id={m}>
      <header>
        <h1>
          <button class="previous plain" {...htmxMonthProps(previousMonth)}>
            &laquo;
          </button>
          <span>{monthName}</span>
          <span {...htmxYearProps(month)}>{year}</span>
          <button className="next plain" {...htmxMonthProps(nextMonth)}>
            &raquo;
          </button>
        </h1>

        <ol>
          <li>
            <span>Mon</span>
          </li>
          <li>
            <span>Tue</span>
          </li>
          <li>
            <span>Wed</span>
          </li>
          <li>
            <span>Thu</span>
          </li>
          <li>
            <span>Fri</span>
          </li>
          <li>
            <span>Sat</span>
          </li>
          <li>
            <span>Sun</span>
          </li>
        </ol>
      </header>
      <ol>
        {grid.map((day) => {
          let dayN = day.date()
          let date = day.format('YYYY-MM-DD')
          let classes = classesFromDateInMonth(day, dayjs(month))
          return (
            <li class={classes} id={'md-' + date}>
              <header>
                <h2 {...htmxDayProps(day)}>{dayN}</h2>
              </header>
              <ol></ol>
            </li>
          )
        })}
      </ol>
    </section>
  )
  return c.html(page)
})

views.get('/week', (c) => {
  let w = c.req.query('w')
  if (!w) {
    return c.redirect('/')
  }

  let monday = dayjs(w.slice(1))
  let sunday = monday.add(6, 'day')
  let start = monday.format('Do')
  let end = sunday.format('Do')
  let monthName = monday.format('MMMM')
  let year = monday.year()
  let next = monday.add(1, 'week')
  let previous = monday.subtract(1, 'week')

  let page = (
    <section id="week" class="week active" data-id={w}>
      <header>
        <h1>
          <button class="previous plain" {...htmxWeekProps(previous)}>
            &laquo;
          </button>
          <span {...htmxDayProps(monday)}>{start}</span>
          <span>to</span>
          <span {...htmxDayProps(sunday)}>{end}</span>
          <span {...htmxMonthProps(monday)}>{monthName},</span>
          <span {...htmxYearProps(monday)}>{year}</span>
          <button className="next plain" {...htmxWeekProps(next)}>
            &raquo;
          </button>
        </h1>
      </header>
      <section class="weekdays">
        <header>
          <ol>
            <li class="weekday"></li>
            {Array.from({ length: 7 }, (_, i) => {
              let day = monday.add(i, 'day')
              let dayName = day.format('ddd')
              let nth = day.format('Do')
              return (
                <li class="weekday">
                  <span>{dayName}</span>
                  <span>{nth}</span>
                </li>
              )
            })}
            <li class="all-day-events">
              <span>all-day</span>
            </li>
            {Array.from({ length: 7 }, (_, i) => {
              let r = Math.random()
              let something = r > 0.9 ? 'all day long' : ''
              something =
                r > 0.95 ? 'really all day long maybe longer' : something
              let n = Math.random() * 10
              return (
                <li class="all-day-events">
                  <ol class="events">
                    {Array.from({ length: n }, (_, i) => {
                      if (something === '') {
                        return ''
                      }
                      return (
                        <li>
                          <article class="event">
                            <header>
                              <h3>{something}</h3>
                            </header>
                          </article>
                        </li>
                      )
                    })}
                  </ol>
                </li>
              )
            })}
          </ol>
        </header>

        <ol class="days">
          {Array.from({ length: 8 }, (_, i) => {
            let day = monday.add(i, 'day')
            let date = day.format('YYYY-MM-DD')
            return (
              <li>
                <ol>
                  {Array.from({ length: 24 }, (_, j) => {
                    let hour = j === 23 ? 0 : j + 1
                    let time = hour.toString().padStart(2, '0')
                    if (i === 0) {
                      return (
                        <li id={`t${hour}`} class="hourslot time">
                          <span>{time}:00</span>
                        </li>
                      )
                    }
                    return (
                      <li id={`dwh${date}T${hour}:00`} class="hourslot">
                        <p></p>
                      </li>
                    )
                  })}
                </ol>
              </li>
            )
          })}
        </ol>
      </section>
    </section>
  )
  return c.html(page)
})

views.get('/day', (c) => {
  let d = c.req.query('d')
  if (!d) {
    return c.redirect('/')
  }

  let day = dayjs(d)
  let dayName = day.format('dddd')
  let nth = day.format('Do')
  let monthName = day.format('MMMM')
  let year = day.year()
  let next = day.add(1, 'day')
  let previous = day.subtract(1, 'day')

  let page = (
    <section id="day" class="day active" data-id={d}>
      <header>
        <h1>
          <button class="previous plain" {...htmxDayProps(previous)}>
            &laquo;
          </button>
          <span>{dayName}</span>
          <span>{nth}</span>
          <span {...htmxMonthProps(day)}>{monthName},</span>
          <span {...htmxYearProps(day)}>{year}</span>
          <button className="next plain" {...htmxDayProps(next)}>
            &raquo;
          </button>
        </h1>
      </header>
      <section>
        <header>
          <span>all-day</span>
          <ol>
            <li>bank-holiday</li>
            <li>sports-fest</li>
            <li>sports-fest</li>
            <li>sports-fest</li>
            <li>sports-fest</li>
            <li>sports-fest</li>
          </ol>
        </header>
        <ol>
          {Array.from({ length: 24 }, (_, i) => {
            let hour = i === 23 ? 0 : i + 1
            let time = hour.toString().padStart(2, '0')
            return (
              <li id={`t${hour}`}>
                <h2>{time}:00</h2>
                <hr />
              </li>
            )
          })}
        </ol>
      </section>
    </section>
  )
  return c.html(page)
})

export default views
