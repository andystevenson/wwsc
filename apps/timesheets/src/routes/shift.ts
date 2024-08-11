import { eq, and, isNull } from 'drizzle-orm'
import { dayjs } from '@wwsc/lib-dates'
import { factory, protectedPage } from '../hono-factory'
import { db, shifts, InsertShift } from '../db/db'
import { type Staff } from '@wwsc/lib-sumup-pos'
import { parse } from 'csv-parse/sync'
import { formatUpload } from '../pos/pos'

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

  let record: InsertShift = {
    uid: request.uid,
    username: user.display_name,
    day: start.format('dddd'),
    start: request.start,
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

  let result = await db.insert(shifts).values(record).returning()
  let newShift = result[0]
  c.set('shift', newShift)

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

  return c.json(updated)
})

shift.post('/approve', async (c) => {
  let request = await c.req.json()
  await db.transaction(async (tx) => {
    for (const update of request) {
      await tx
        .update(shifts)
        .set({ ...update })
        .where(eq(shifts.id, update.id))
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
      await tx.insert(shifts).values(record)
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

export default shift
