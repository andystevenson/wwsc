import { Page } from './Page'
import tags from './Tags'
import { type WithSession, Hono } from '../Hono'

const newTags = structuredClone(tags)
newTags.scripts.push('/js/sales.js')

const sales = new Hono<WithSession>()

sales.get('/', (c) => {
  const session = c.get('session')

  return c.html(
    <Page tags={newTags}>
      <h1>Sales</h1>
      <p id="username"></p>
    </Page>,
  )
})

export default sales
