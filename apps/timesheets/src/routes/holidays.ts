import { dayjs } from '@wwsc/lib-dates'
import { factory, protectedPage } from '../hono-factory'
import { db, holidays, and, eq, gte, asc, shifts } from '../db/db'
import { zeroHourStaff, permanentStaff, ids } from '../pos/pos'
import {
  permanent,
  zerohours,
  permanentHolidaysHTML,
  zerohoursHolidaysHTML,
} from '../utilities/holidaysHTML'
import { parse } from 'csv-parse/sync'

const route = factory.createApp()

route.use(protectedPage)

route.get('/', async (c) => {
  console.log('holidays')
  let staff = c.get('user')
  if (!staff) {
    return c.redirect('/')
  }

  let days = await getHolidays(staff.display_name)

  let html = ''
  if (staff.isPermanent) {
    html = permanentHolidaysHTML(days)
  }

  if (staff.isZeroHours) {
    html = zerohoursHolidaysHTML(days)
  }
  return c.html(html)
})

route.post('/upload', async (c) => {
  let request = await c.req.json()

  let csv = request.payload
  let records = parse(csv, { columns: true, skip_empty_lines: true })

  // insert the records into the database
  await db.transaction(async (tx) => {
    for (const record of records) {
      await tx.insert(holidays).values(record)
    }
  })

  return c.json(records)
})

route.get('/report', async (c) => {
  let zeros = []
  for (const staff of zeroHourStaff()) {
    if (!staff.active) continue
    let days = await getHolidays(staff.display_name)
    zeros.push(zerohours(days))
  }

  let perms = []
  for (const staff of permanentStaff()) {
    if (!staff.active) continue

    let days = await getHolidays(staff.display_name)
    perms.push(permanent(days))
  }

  zeros = zeros.sort((a, b) => a.who.localeCompare(b.who))
  perms = perms.sort((a, b) => a.who.localeCompare(b.who))
  return c.json({ zeros, perms })
})

async function getLastBfwd(staff: string) {
  let bfwd = await db
    .select()
    .from(holidays)
    .where(and(eq(holidays.name, staff), eq(holidays.type, 'bfwd')))
    .orderBy(asc(holidays.date))

  return bfwd.length ? bfwd[bfwd.length - 1] : null
}

async function getHolidays(staff: string) {
  let bfwd = await getLastBfwd(staff)
  if (!bfwd) {
    return []
  }

  let days = await db
    .select()
    .from(holidays)
    .where(and(gte(holidays.date, bfwd.date), eq(holidays.name, staff)))

  return days
}

export default route
