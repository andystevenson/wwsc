import { Page } from '@wwsc/lib-hono'
import { factory } from '../hono-factory'
import tags from './pageTags'
import dayjs from 'dayjs'

let userTags = structuredClone(tags)

userTags.scripts = [
  'https://unpkg.com/htmx.org@2.0.1',
  'https://unpkg.com/htmx-ext-json-enc@2.0.0/json-enc.js',
  'https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js',
  'https://cdn.jsdelivr.net/npm/dayjs@1/plugin/advancedFormat.js',
  'https://cdn.jsdelivr.net/npm/dayjs@1/plugin/duration.js',
  'https://cdn.jsdelivr.net/npm/dayjs@1/plugin/relativeTime.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.js',
  'https://unpkg.com/gridjs/dist/gridjs.umd.js',
  '/js/user.js',
  '/js/clock.js',
  '/js/logout.js',
  '/js/printer.js'
]

const user = factory.createApp()

user.get('/', (c) => {
  const user = c.get('user')
  if (!user) {
    return c.redirect('/')
  }

  let privileges = user.mobile ? user.mobile.split(',')[0] : 'user'
  const shift = c.get('shift')
  const onshift = shift ? 'shift active' : 'shift'
  const clockin = shift ? 'clockin' : 'clockin active'
  const startDateTime = shift ? shift.start : ''
  const startTime = shift ? dayjs(shift.start).format('HH:mm') : '00:00'
  let bodyClass = `page ${privileges}`
  return c.html(
    <Page tags={userTags} bodyClass={bodyClass}>
      <header>
        <img src='favicon.svg' alt='West Warwickshire Sports Club icon' />
        <button class='logout'>
          <span>logout</span>
        </button>
      </header>
      <main>
        <section class='now'>
          <h1 class='username'>{user?.display_name}</h1>
          <time class='date' datetime=''>
            Today
          </time>
          <time class='clock' datetime=''>
            00:00:00
          </time>
          <button
            class={clockin}
            data-uid={user.id}
            data-id={shift ? shift.id : ''}>
            clock in
          </button>
          <section class={onshift}>
            <section class='sameday'>
              <span class='start-label'>start</span>
              <time class='start clock' datetime={startDateTime}>
                {startTime}
              </time>
              <span class='end-label'>end</span>
              <time class='end clock' datetime=''></time>
              <span class='duration-label'>duration</span>
              <time datetime='' class='duration clock'>
                00:00:00
              </time>
              <button class='clockout'>clock out</button>
            </section>
            <section class='notes'>
              <label title='no-breaks must approved by F&B manager'>
                <span>no-breaks</span>
                <input type='checkbox' name='nobreaks' />
              </label>
              <label title='supervisor must be prior agreed by F&B manager'>
                <span>supervisor</span>
                <input type='checkbox' name='supervisor' />
              </label>
              <label>
                <input type='text' name='notes' placeholder='add notes' />
              </label>
            </section>
          </section>
        </section>

        <details class='history'>
          <summary>history</summary>
          <details
            name='history'
            class='today'
            hx-trigger='toggle[this.open]'
            hx-target='.today .content'
            hx-post='/history/today'
            hx-ext='json-enc'
            hx-indicator='.today summary'
            title="today's shift history">
            <summary>today</summary>
            <section class='content'></section>
          </details>
          <details
            name='history'
            class='week'
            hx-trigger='toggle[this.open]'
            hx-target='.week .content'
            hx-post='/history/week'
            hx-ext='json-enc'
            hx-indicator='.week summary'
            title="this week's shift history">
            <summary>week</summary>
            <section class='content'></section>
          </details>
          <details
            name='history'
            class='last7'
            hx-trigger='toggle[this.open]'
            hx-target='.last7 .content'
            hx-post='/history/last7'
            hx-ext='json-enc'
            hx-indicator='.last7 summary'
            title='last 7 days shift history'>
            <summary>last 7 days</summary>
            <section class='content'></section>
          </details>
          <details
            name='history'
            class='fortnight'
            hx-trigger='toggle[this.open]'
            hx-target='.fortnight .content'
            hx-post='/history/fortnight'
            hx-ext='json-enc'
            hx-indicator='.fortnight summary'
            title="this fortnight's shift history">
            <summary>fortnight</summary>
            <section class='content'></section>
          </details>
          <details
            name='history'
            class='last14'
            hx-trigger='toggle[this.open]'
            hx-target='.last14 .content'
            hx-post='/history/last14'
            hx-ext='json-enc'
            hx-indicator='.last14 summary'
            title='last 14 days shift history'>
            <summary>last 14 days</summary>
            <section class='content'></section>
          </details>
          <details
            name='history'
            class='month'
            hx-trigger='toggle[this.open]'
            hx-target='.month .content'
            hx-post='/history/month'
            hx-ext='json-enc'
            hx-indicator='.month summary'
            title="this month's shift history">
            <summary>month</summary>
            <section class='content'></section>
          </details>
          <details
            name='history'
            class='last30'
            hx-trigger='toggle[this.open]'
            hx-target='.last30 .content'
            hx-post='/history/last30'
            hx-ext='json-enc'
            hx-indicator='.last30 summary'
            title='last 30 days shift history'>
            <summary>last 30 days</summary>
            <section class='content'></section>
          </details>
          <details
            name='history'
            class='year'
            hx-trigger='toggle[this.open]'
            hx-target='.year .content'
            hx-post='/history/year'
            hx-ext='json-enc'
            hx-indicator='.year summary'
            title="this year's shift history">
            <summary>year</summary>
            <section class='content'></section>
          </details>
        </details>
        <details class='reports'>
          <summary>
            <span>reports</span>
          </summary>
          <details
            class='new-zerohours'
            name='reports'
            hx-trigger='toggle[this.open]'
            hx-target='.new-zerohours .content'
            hx-post='/reports/new-zerohours'
            hx-ext='json-enc'
            hx-indicator='.new-zerohours summary'
            title='zero-hour staff reports'>
            <summary>new-zero-hours</summary>
            <section class='content'></section>
          </details>
          <details
            class='zerohours'
            name='reports'
            hx-trigger='toggle[this.open]'
            hx-target='.zerohours .content'
            hx-post='/reports/zerohours'
            hx-ext='json-enc'
            hx-indicator='.zerohours summary'
            title='zero-hour staff reports'>
            <summary>zero-hours</summary>
            <section class='content'></section>
          </details>
          <details
            class='permanent'
            name='reports'
            hx-trigger='toggle[this.open]'
            hx-target='.permanent .content'
            hx-post='/reports/permanent'
            hx-ext='json-enc'
            hx-indicator='.permanent summary'
            title='permanent staff reports'>
            <summary>
              <span>permanent</span>
            </summary>
            <section class='content'></section>
          </details>
          <details
            class='combined'
            name='reports'
            hx-trigger='toggle[this.open]'
            hx-target='.combined .content'
            hx-post='/reports/combined'
            hx-ext='json-enc'
            hx-indicator='.combined summary'
            title='permanent staff reports'>
            <summary>
              <span>combined</span>
            </summary>
            <section class='content'></section>
          </details>
          <details class='holidays'>
            <summary>holidays</summary>
            <section class='permanent'></section>
            <section class='zerohours'></section>
          </details>
        </details>
        <details
          class='holidays'
          name='holidays'
          hx-trigger='toggle[this.open]'
          hx-target='.holidays .content'
          hx-get='/holidays'
          hx-ext='json-enc'
          hx-indicator='.holidays summary'
          title='holidays records'>
          <summary>holidays</summary>
          <section class='content'></section>
        </details>
      </main>
      <footer>
        <p>Copyright © 2024 - West Warwickshire Sports Complex</p>
        <small>(Company registered in England: 05618704)</small>
      </footer>
      <dialog class='errors'>
        <p class='content'></p>
        <button class='cancel' autofocus>
          esc
        </button>
      </dialog>
      <dialog class='confirmation'>
        <p class='content'></p>
        <button class='cancel' autofocus>
          cancel
        </button>
        <button class='confirm'>confirm</button>
      </dialog>
    </Page>
  )
})

export default user
