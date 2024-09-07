import { Page } from '@wwsc/lib-hono'
import { factory } from '../hono-factory'
import tags from './tags'
import { dayjs, dayWeekMonthYear } from '@wwsc/lib-dates'
let newTags = structuredClone(tags)
newTags.scripts = [
  'https://unpkg.com/htmx.org@2.0.1',
  'https://unpkg.com/htmx-ext-json-enc@2.0.0/json-enc.js',
  'https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js',
  'https://cdn.jsdelivr.net/npm/dayjs@1/plugin/advancedFormat.js',
  'https://cdn.jsdelivr.net/npm/dayjs@1/plugin/duration.js',
  'https://cdn.jsdelivr.net/npm/dayjs@1/plugin/relativeTime.js',
  '/js/home.js',
  '/js/keys.js',
]

const home = factory.createApp()

home.get('/', (c) => {
  let todayDate = dayjs()
  let today = todayDate.format('YYYY-MM-DD')
  let { day, week, month, year } = dayWeekMonthYear(today)

  let page = (
    <Page tags={newTags}>
      <header>
        <button id="add" class="plain">
          <span>&#xFF0B;</span>
        </button>
        <nav id="timespan">
          <ol>
            <li>
              <button
                class="day plain"
                hx-get={'/views/day?d=' + day}
                hx-target="#day"
                hx-swap="outerHTML"
                data-next={day}
              >
                day
              </button>
            </li>
            <li>
              <button
                class="week plain"
                hx-get={'/views/week?w=' + week}
                hx-target="#week"
                hx-swap="outerHTML"
                data-next={week}
              >
                week
              </button>
            </li>
            <li>
              <button
                class="month plain"
                hx-get={'/views/month?m=' + month}
                hx-target="#month"
                hx-swap="outerHTML"
                data-next={month}
              >
                month
              </button>
            </li>
            <li class="active">
              <button
                class="year plain"
                hx-get={'/views/year?y=' + year}
                hx-target="#year"
                hx-swap="outerHTML"
                data-next={year}
              >
                year
              </button>
            </li>
          </ol>
        </nav>
      </header>
      <main>
        <section
          id="year"
          hx-get={'/views/year?y=' + dayjs().year()}
          hx-trigger="load"
          hx-swap="outerHTML"
          hidden
        ></section>
        <section id="month"></section>
        <section id="week"></section>
        <section id="day"></section>
      </main>
      <footer></footer>
    </Page>
  )
  return c.html(page)
})

export default home
