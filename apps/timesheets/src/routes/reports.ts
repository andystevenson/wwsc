import { gte, lte, and, asc, inArray, isNotNull } from 'drizzle-orm'
import { dayjs } from '@wwsc/lib-dates'
import { factory, protectedPage } from '../hono-factory'
import { db, shifts } from '../db/db'
import { fortnightHTML } from '../utilities/fortnightHTML'
import { permanentHTML } from '../utilities/permanentHTML'
import { combinedHTML } from '../utilities/combinedHTML'
import {
  allFortnights,
  allNewFortnights,
  allMonths
} from '../utilities/reports'
import { zeroHourStaff, permanentStaff, ids } from '../pos/pos'
import { shiftSummaryHTML } from '../utilities/shiftSummaryHTML'

const reports = factory.createApp()

reports.use(protectedPage)

reports.post('/new-zerohours', async (c) => {
  console.log('new-zerohours')
  let fortnights = allNewFortnights()
  let html = fortnights
    .map((fortnight) => fortnightHTML(fortnight.start, fortnight.end))
    .join('')
  return c.html(html)
})

reports.get('/new-zerohours', async (c) => {
  let start = c.req.query('start')
  let end = c.req.query('end')
  if (!start || !end) {
    return c.json({ error: 'missing start or end date' })
  }
  let staff = ids(zeroHourStaff())
  let shifts = await shiftsInDateRange(start, end, staff)
  let result = shiftSummaryHTML(shifts)
  return c.html(result)
})

reports.post('/zerohours', async (c) => {
  console.log('zerohours')
  let earliest = await earliestShift()
  let fortnights = allFortnights(earliest[0].start)
  let html = fortnights
    .map((fortnight) => fortnightHTML(fortnight.start, fortnight.end))
    .join('')
  return c.html(html)
})

reports.get('/zerohours', async (c) => {
  let start = c.req.query('start')
  let end = c.req.query('end')
  if (!start || !end) {
    return c.json({ error: 'missing start or end date' })
  }
  let staff = ids(zeroHourStaff())
  let shifts = await shiftsInDateRange(start, end, staff)
  let result = shiftSummaryHTML(shifts)
  return c.html(result)
})

reports.post('/permanent', async (c) => {
  let earliest = await earliestShift()
  let months = allMonths(earliest[0].start)
  let html = months.map((month) => permanentHTML(month)).join('')
  return c.html(html)
})

reports.get('/permanent', async (c) => {
  let start = c.req.query('start')
  if (!start) {
    return c.json({ error: 'missing start date' })
  }

  let end = dayjs(start).endOf('month').format('YYYY-MM-DD')
  let staff = ids(permanentStaff())
  let shifts = await shiftsInDateRange(start, end, staff)
  let result = shiftSummaryHTML(shifts)
  return c.html(result)
})

reports.post('/combined', async (c) => {
  let earliest = await earliestShift()
  let months = allMonths(earliest[0].start)
  let html = months.map((month) => combinedHTML(month)).join('')
  return c.html(html)
})

reports.get('/combined', async (c) => {
  let start = c.req.query('start')
  if (!start) {
    return c.json({ error: 'missing start date' })
  }

  let end = dayjs(start).endOf('month').format('YYYY-MM-DD')
  let staff = ids(permanentStaff()).concat(ids(zeroHourStaff()))
  let shifts = await shiftsInDateRange(start, end, staff)
  let result = shiftSummaryHTML(shifts)
  return c.html(result)
})

async function earliestShift() {
  return await db.select().from(shifts).orderBy(asc(shifts.start)).limit(1)
}

async function shiftsInDateRange(
  start: string,
  end: string,
  ids: string[] = []
) {
  return await db
    .select()
    .from(shifts)
    .where(
      and(
        isNotNull(shifts.end),
        gte(shifts.start, start),
        lte(shifts.start, end + 'T23:59'),
        inArray(shifts.uid, ids)
      )
    )
    .orderBy(asc(shifts.start))
}
export default reports
