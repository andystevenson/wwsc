import { Hono, type WithSession } from '../Hono'

const user = new Hono<WithSession>()

user.get('/', async (c) => {
  return c.redirect('/sage/user')
})

export default user
