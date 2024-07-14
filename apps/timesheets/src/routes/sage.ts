import {
  getUser,
  getBankAccounts,
  getLedgerAccounts,
  getPaymentMethods,
  getTaxRates,
} from '@wwsc/lib-sage'

import { getDailyTakings } from '../db/getDailyTakings'
import { postDailyTakings } from '../db/postDailyTakings'
import { reverseDailyTakings } from '../db/reverseDailyTakings'
import { postMonthlyTakings } from '../db/postMonthlyTakings'
import { reverseMonthlyTakings } from '../db/reverseMonthlyTakings'

import { refresh, factory } from '../Hono'

const sage = factory.createApp()
sage.use(refresh)

sage.get('/', async (c) => {
  const user = c.get('user')
  console.warn('/sage/user', user)
  return c.json(user)
})

sage.get('/user', async (c) => {
  const user = await getUser(c.get('access_token'))
  return c.json(user)
})

sage.get('/bank-accounts', async (c) => {
  const bankAccounts = await getBankAccounts(c.get('access_token'))
  return c.json(bankAccounts)
})

sage.get('/payment-methods', async (c) => {
  const paymentMethods = await getPaymentMethods(c.get('access_token'))
  return c.json(paymentMethods)
})

sage.get('/ledger-accounts', async (c) => {
  const ledgerAccounts = await getLedgerAccounts(c.get('access_token'))
  return c.json(ledgerAccounts)
})

sage.get('/tax-rates', async (c) => {
  const taxRates = await getTaxRates(c.get('access_token'))
  return c.json(taxRates)
})

sage.get('/daily-takings', async (c) => {
  const date = c.req.query('date')
  if (!date) {
    c.status(400)
    return c.json({ error: '/sage/daily-takings Missing date' })
  }
  const dailyTakings = await getDailyTakings(date)
  return c.json(dailyTakings)
})

sage.get('/post-daily-takings', async (c) => {
  const date = c.req.query('date')
  if (!date) {
    c.status(400)
    return c.json({ error: '/sage/post-daily-takings Missing date' })
  }
  const dailyTakings = await postDailyTakings(c.get('access_token'), date)
  return c.json(dailyTakings)
})

sage.get('/reverse-daily-takings', async (c) => {
  const date = c.req.query('date')
  if (!date) {
    c.status(400)
    return c.json({ error: '/sage/reverse-daily-takings Missing date' })
  }
  const dailyTakings = await reverseDailyTakings(c.get('access_token'), date)
  return c.json(dailyTakings)
})

sage.get('/post-monthly-takings', async (c) => {
  const date = c.req.query('date')
  if (!date) {
    c.status(400)
    return c.json({ error: '/sage/post-monthly-takings Missing date' })
  }
  const dailyTakings = await postMonthlyTakings(c.get('access_token'), date)
  return c.json(dailyTakings)
})

sage.get('/reverse-monthly-takings', async (c) => {
  const date = c.req.query('date')
  if (!date) {
    c.status(400)
    return c.json({ error: '/sage/reverse-monthly-takings Missing date' })
  }
  const dailyTakings = await reverseMonthlyTakings(c.get('access_token'), date)
  return c.json(dailyTakings)
})

export default sage
