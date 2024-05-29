import { getPaymentMethods, type Token } from '@wwsc/lib-sage'

import { Hono, type WithSession } from '../Hono'

const user = new Hono<WithSession>()

user.get('/', async (c) => {
  const session = c.get('session')
  let token = session.get('token') as Token
  if (!token) return c.redirect('/')
  const paymentMethods = await getPaymentMethods(token.access_token)
  session.set('paymentMethods', paymentMethods)
  return c.json(paymentMethods)
})

export default user
