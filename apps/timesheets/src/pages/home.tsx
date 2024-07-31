import { Page } from './Page'
import { factory } from '../Hono'
import tags from './Tags'
let newTags = structuredClone(tags)
newTags.scripts = ['/js/home.js']

const home = factory.createApp()

home.get('/', (c) => {
  const session = c.get('session')
  const user = session?.get('user')
  console.log('home', user)
  return c.html(
    <Page tags={newTags}>
      <img
        class="icon"
        src="favicon.svg"
        alt="West Warwickshire Sports Club icon"
      />
      <dialog class="login">
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
