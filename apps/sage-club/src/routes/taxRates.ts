import { getTaxRates, type Token } from '@wwsc/lib-sage'

import { Hono, type WithSession } from '../Hono'

const user = new Hono<WithSession>()

user.get('/', async (c) => {
  const session = c.get('session')
  let token = session.get('token') as Token
  if (!token) return c.redirect('/')
  const taxRates = await getTaxRates(token.access_token)
  session.set('taxRates', taxRates)
  return c.json(taxRates)
})

export default user
