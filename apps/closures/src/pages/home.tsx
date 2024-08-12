import { Hono, Page } from '@wwsc/lib-hono'
import { dayjs } from '@wwsc/lib-dates'
import tags from './tags'
let newTags = structuredClone(tags)
newTags.scripts = [
  'https://unpkg.com/htmx.org@2.0.1',
  'https://unpkg.com/htmx-ext-json-enc@2.0.0/json-enc.js',
  'https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js',
  'https://cdn.jsdelivr.net/npm/dayjs@1/plugin/advancedFormat.js',
  'https://cdn.jsdelivr.net/npm/dayjs@1/plugin/duration.js',
  'https://cdn.jsdelivr.net/npm/dayjs@1/plugin/relativeTime.js',
  '/js/home.js',
]
const home = new Hono()

home.get('/', (c) => {
  let months = last12Months()
  return c.html(
    <Page tags={newTags} bodyClass="closures">
      <></>
      <main>
        <details class="closure-months">
          <summary>register closures</summary>
          <section class="content">
            {months.map((month) => (
              <details
                name={`month-${month}`}
                class={`month-${month} closure-month`}
                hx-trigger="toggle[this.open]"
                hx-target={`.month-${month} .content`}
                hx-get={`/closures/month?month=${month}`}
                hx-indicator={`.month-${month} summary`}
                title={`${month} closures`}
              >
                <summary>{dayjs(month).format('MMMM YYYY')}</summary>
                <section class={`content ${month}`}></section>
              </details>
            ))}
          </section>
        </details>
      </main>
    </Page>,
  )
})

function last12Months() {
  let thisMonth = dayjs().startOf('month')
  let months = []
  for (let i = 0; i < 12; i++) {
    months.push(thisMonth.format('YYYY-MM'))
    thisMonth = thisMonth.subtract(1, 'month')
  }
  return months
}

export default home
