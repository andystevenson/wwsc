import { getBankAccounts, type Token } from '@wwsc/lib-sage'

import { Hono, type WithSession } from '../Hono'

const user = new Hono<WithSession>()

user.get('/', async (c) => {
  const session = c.get('session')
  let token = session.get('token') as Token
  if (!token) return c.redirect('/')
  const bankAccounts = await getBankAccounts(token.access_token)
  session.set('bankAccounts', bankAccounts)

  return c.json(bankAccounts)
})

export default user
