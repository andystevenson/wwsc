import { Page } from './Page'
import { type WithSession, Hono } from '../Hono'
import tags from './Tags'

const home = new Hono<WithSession>()

home.get('/', (c) => {
  const session = c.get('session')
  return c.html(
    <Page tags={tags}>
      <h1>Hello world</h1>
      <h2>and other stuff</h2>
      <img src="/favicon.svg" alt="pretty" />
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </Page>,
  )
})

export default home
