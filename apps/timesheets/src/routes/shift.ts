import { eq, and, isNull } from 'drizzle-orm'
import { dayjs } from '@wwsc/lib-dates'
import { factory, protectedPage } from '../Hono'
import { db, shifts, InsertShift } from '../db/db'
import { type Staff } from '@wwsc/lib-sumup-pos'

const shift = factory.createApp()

shift.use(protectedPage)

shift.post('/clockin', async (c) => {
  let request = await c.req.json()
  let start = dayjs(request.start)

  let session = c.get('session')
  let user = session.get('user') as Staff
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
    session.set('shift', existingShift)
    return c.json(existingShift)
  }

  let result = await db.insert(shifts).values(record).returning()
  let newShift = result[0]
  session.set('shift', newShift)
  console.log('clockin', request, newShift)

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
  let session = c.get('session')
  session.set('shift', null)

  console.log('clockout', request, updated)
  return c.json(updated)
})

shift.post('/approve', async (c) => {
  let request = await c.req.json()
  console.log('approve', request)
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

export default shift
