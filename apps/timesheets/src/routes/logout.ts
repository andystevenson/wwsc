import { Hono, type WithSession } from '../Hono'

const logout = new Hono<WithSession>()

logout.get('/', (c) => {
  const session = c.get('session')

  const callback = session.get('callback')
  const token = session.get('token')
  console.log('callback in logout', callback)
  console.log('token in logout', token)

  session.deleteSession()
  return c.redirect('/')
})

export default logout
