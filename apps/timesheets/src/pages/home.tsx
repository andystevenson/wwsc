import { Page } from './Page'
import { type WithSession, Hono } from '../Hono'
import tags from './Tags'

const home = new Hono<WithSession>()

home.get('/', (c) => {
  const session = c.get('session')
  const callback = session.get('callback')
  const token = session.get('token')
  console.log('callback in home', callback)
  console.log('token in home', token)
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
