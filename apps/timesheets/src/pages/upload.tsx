import { Page } from './Page'
import { factory } from '../hono-factory'
import tags from './Tags'
import { type Staff } from '@wwsc/lib-sumup-pos'
import { type Shift } from '../db/Types'
import dayjs from 'dayjs'

let userTags = structuredClone(tags)

userTags.scripts = [
  'https://unpkg.com/htmx.org@2.0.1',
  'https://unpkg.com/htmx-ext-json-enc@2.0.0/json-enc.js',
  'https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js',
  'https://cdn.jsdelivr.net/npm/dayjs@1/plugin/advancedFormat.js',
  'https://cdn.jsdelivr.net/npm/dayjs@1/plugin/duration.js',
  'https://cdn.jsdelivr.net/npm/dayjs@1/plugin/relativeTime.js',
  'https://unpkg.com/gridjs/dist/gridjs.umd.js',
  '/js/clock.js',
  '/js/logout.js',
  '/js/upload.js',
]

const upload = factory.createApp()

upload.get('/', (c) => {
  const user = c.get('user') as Staff
  return c.html(
    <Page tags={userTags} bodyClass="page">
      <header>
        <img src="favicon.svg" alt="West Warwickshire Sports Club icon" />
        <button class="logout">
          <span>logout</span>
        </button>
      </header>
      <main>
        <section class="now">
          <h1 class="username">{user?.display_name}</h1>
          <time class="date" datetime="">
            Today
          </time>
          <time class="clock" datetime="">
            00:00:00
          </time>
        </section>
        <section class="upload">
          <button>
            <span>upload</span>
          </button>
          <input type="file" name="file" accept=".csv" />
          <input type="hidden" name="payload" />
          <pre>
            <code class="contents"></code>
          </pre>
        </section>
      </main>
      <footer>
        <p>Copyright © 2024 - West Warwickshire Sports Complex</p>
        <small>(Company registered in England: 05618704)</small>
      </footer>
      <dialog class="errors">
        <p class="message"></p>
        <button class="cancel" autofocus>
          <span>esc</span>
        </button>
      </dialog>
    </Page>,
  )
})

export default upload
