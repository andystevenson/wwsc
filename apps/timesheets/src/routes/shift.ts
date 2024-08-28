import { eq, gte, and, isNull, isNotNull } from 'drizzle-orm'
import { dayjs } from '@wwsc/lib-dates'
import { factory, protectedPage } from '../hono-factory'
import {
  db,
  shifts,
  holidays,
  type InsertShift,
  type InsertHoliday,
} from '../db/db'
import { parse } from 'csv-parse/sync'
import { formatUpload, findStaff } from '../pos/pos'
import { Big } from 'big.js'
import isBankHoliday from '../utilities/isBankHoliday'

const accrualFactor = 0.127
const shift = factory.createApp()

shift.use(protectedPage)

shift.post('/clockin', async (c) => {
  let request = await c.req.json()
  let start = dayjs(request.start)

  let session = c.get('session')
  let user = c.get('user')

  if (!session || !user) {
    return c.redirect('/')
  }

  // if the user is already clocked in, return the current shift
  let current = await db
    .select()
    .from(shifts)
    .where(and(eq(shifts.uid, request.uid), isNull(shifts.end)))

  if (current.length > 1) {
    console.error('multiple shifts open for user', request.uid, current)
  }

  if (current.length) {
    let existingShift = current[0]
    c.set('shift', existingShift)
    return c.json(existingShift)
  }

  // create a new shift record
  let record: InsertShift = {
    uid: request.uid,
    username: user.display_name,
    day: start.format('dddd'),
    start: request.start,
  }
  let result = await db.insert(shifts).values(record).returning()
  let newShift = result[0]
  c.set('shift', newShift)

  let isBankHoliday = c.get('isBankHoliday')
  let isPermanent = user.isPermanent
  let isZeroHours = user.isZeroHours

  let createHoliday = isZeroHours || (isPermanent && isBankHoliday)

  if (!createHoliday) {
    return c.json(newShift)
  }

  // create a holiday record to track the shift
  let holiday: InsertHoliday = {
    name: user.display_name,
    date: start.format('YYYY-MM-DD'),
    type: 'acc',
    hours: 0,
    shiftId: newShift.id,
  }

  let newHoliday = await db.insert(holidays).values(holiday).returning()

  return c.json(newShift)
})

shift.post('/clockout', async (c) => {
  let request = await c.req.json()
  let result = await db
    .update(shifts)
    .set({ ...request })
    .where(eq(shifts.id, request.id))
    .returning()

  let updated = result[0]
  c.set('shift', null)

  // update the holiday record with the duration accrued
  let { start, end } = request
  let startTime = dayjs(start)
  let endTime = dayjs(end)
  let duration = Big(endTime.diff(startTime, 'hours', true))
    .times(accrualFactor)
    .round(2, Big.roundUp)
    .toNumber()

  let holiday = await db
    .update(holidays)
    .set({ hours: duration })
    .where(eq(holidays.shiftId, request.id))

  return c.json(updated)
})

shift.post('/approve', async (c) => {
  let request = await c.req.json()
  await db.transaction(async (tx) => {
    for (const update of request) {
      let result = await tx
        .update(shifts)
        .set({ ...update })
        .where(eq(shifts.id, update.id))

      let start = dayjs(update.start)
      let end = dayjs(update.end)
      if (!start.isValid() || !end.isValid()) {
        continue
      }

      let duration = Big(end.diff(start, 'hours', true))
        .times(accrualFactor)
        .round(2, Big.roundUp)
        .toNumber()

      let holiday = await tx
        .update(holidays)
        .set({ hours: end.diff(start, 'hours', true) })
        .where(eq(holidays.shiftId, update.id))
    }
  })
  return c.json(request)
})

shift.post('/upload', async (c) => {
  let request = await c.req.json()

  let csv = request.payload
  let records = parse(csv, { columns: true, skip_empty_lines: true })
  let formatted = await formatUpload(records)
  if (formatted.errors.length > 0) {
    return c.json(formatted)
  }

  // insert the records into the database
  await db.transaction(async (tx) => {
    for (const record of formatted.shifts) {
      let result = await tx.insert(shifts).values(record).returning()

      let start = dayjs(record.start)
      let end = dayjs(record.end)
      if (!start.isValid() || !end.isValid()) {
        continue
      }

      let isBhol = await isBankHoliday(start.format('YYYY-MM-DD'))
      let staff = await findStaff(record.uid)
      if (!staff) {
        continue
      }
      let isZeroHours = staff.isZeroHours
      let isPermanent = staff.isPermanent

      let createHoliday = isZeroHours || (isPermanent && isBhol)
      if (!createHoliday) {
        continue
      }

      let duration =
        isPermanent && isBhol
          ? 8
          : Big(end.diff(start, 'hours', true))
              .times(accrualFactor)
              .round(2, Big.roundUp)
              .toNumber()

      let holiday: InsertHoliday = {
        name: record.username,
        date: start.format('YYYY-MM-DD'),
        type: 'acc',
        hours: duration,
        shiftId: result[0].id,
      }
      await tx.insert(holidays).values(holiday)
    }
  })

  return c.json(formatted)
})

shift.post('/deletes', async (c) => {
  let request = await c.req.json()
  await db.transaction(async (tx) => {
    for (const id of request) {
      await tx.delete(shifts).where(eq(shifts.id, id))
    }
  })
  return c.json(request)
})

shift.get('/sync', async (c) => {
  let date = c.req.query('date')
  if (!date) {
    console.error('/sync no date')
    return c.json({ error: 'no date' })
  }

  let zeros = []
  let perms = []
  let start = dayjs(date).startOf('day').format('YYYY-MM-DD')
  let inscope = await db
    .select()
    .from(shifts)
    .where(and(gte(shifts.start, start), isNotNull(shifts.end)))

  for (const shift of inscope) {
    let staff = await findStaff(shift.uid)
    if (!staff) {
      continue
    }

    let isZeroHours = staff.isZeroHours
    let isPermanent = staff.isPermanent
    let isBhol = await isBankHoliday(shift.start)
    let createHoliday = isZeroHours || (isPermanent && isBhol)
    if (!createHoliday) {
      continue
    }

    let start = dayjs(shift.start)
    let end = dayjs(shift.end)
    let duration =
      isPermanent && isBhol
        ? 8
        : Big(end.diff(start, 'hours', true))
            .times(accrualFactor)
            .round(2, Big.roundUp)
            .toNumber()

    let record: InsertHoliday = {
      name: shift.username,
      date: start.format('YYYY-MM-DD'),
      type: 'acc',
      hours: duration,
      shiftId: shift.id,
    }

    let holiday = await db.insert(holidays).values(record).returning()
    isPermanent ? perms.push(holiday[0]) : zeros.push(holiday[0])
  }
  return c.json({ date, inscope, zeros, perms })
})

export default shift
