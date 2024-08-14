import { Hono, Page } from '@wwsc/lib-hono'
import { dayjs } from '@wwsc/lib-dates'
import { login, logout, registerClosures } from '@wwsc/lib-sumup-pos'
import { closuresHTML } from '../utilities/closuresHTML'

const closures = new Hono()

closures.get('/month', async (c) => {
  let month = c.req.query('month')
  if (!month) return c.json({ error: 'month is required' }, 400)

  let start = dayjs(month).startOf('month')
  let end = start.endOf('month')
  await login()
  let closures = await registerClosures(start, end)
  await logout()
  let startTime = start.format('YYYY-MM-DD')
  let endTime = end.format('YYYY-MM-DD')
  console.log(`closures for ${startTime} to ${endTime}`)

  return c.html(closuresHTML(closures.data))
})

export default closures
