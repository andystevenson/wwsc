import { Page } from '@wwsc/lib-hono'
import { factory } from '../hono-factory'
import tags from './pageTags'
let newTags = structuredClone(tags)
newTags.scripts = ['/js/home.js']

const home = factory.createApp()

home.get('/', (c) => {
  return c.html(
    <Page tags={newTags}>
      <header>
        <img
          class="icon"
          src="favicon.svg"
          alt="West Warwickshire Sports Club icon"
        />
      </header>
      <dialog class="login">
        <h1>timesheets</h1>
        <ul class="digits">
          <li>
            <button>7</button>
          </li>
          <li>
            <button>8</button>
          </li>
          <li>
            <button>9</button>
          </li>
          <li>
            <button>4</button>
          </li>
          <li>
            <button>5</button>
          </li>
          <li>
            <button>6</button>
          </li>
          <li>
            <button>1</button>
          </li>
          <li>
            <button>2</button>
          </li>
          <li>
            <button>3</button>
          </li>
          <li></li>
          <li>
            <button>0</button>
          </li>
        </ul>
        <form method="dialog" id="form">
          <input
            type="password"
            name="password"
            id="password"
            maxlength={4}
            minlength={4}
            pattern="[0-9]{4}"
            placeholder="4 digit passcode required"
            inputmode="numeric"
            required
            autofocus
          />
          <div id="error-message"></div>
        </form>
      </dialog>
    </Page>,
  )
})

export default home
