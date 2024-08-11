import { factory, protectedPage, Context } from '../hono-factory'
import { dayjs, dateTimeRange, type DateTimeRange } from '@wwsc/lib-dates'
import { longerHTML } from '../utilities/shiftHTML'
import { type Staff } from '@wwsc/lib-sumup-pos'
import { db, shifts, type SelectShift } from '../db/db'
import { and, gte, lt, eq, asc } from 'drizzle-orm'
import { findStaff } from '../pos/pos'

const history = factory.createApp()

history.use(protectedPage)

const selectShifts = async (c: Context, range: DateTimeRange) => {
  let user = c.get('user') as Staff
  let privileges =
    user.display_order === 127
      ? 'superuser'
      : user.mobile === 'admin'
      ? 'admin'
      : 'user'

  let { startTime, endTime } = dateTimeRange(range)

  let history =
    privileges !== 'user'
      ? // select all the shifts in the range
        await db
          .select()
          .from(shifts)
          .orderBy(asc(shifts.start))
          .where(and(gte(shifts.start, startTime), lt(shifts.start, endTime)))
      : // select only the shifts for the user in the range
        await db
          .select()
          .from(shifts)
          .orderBy(asc(shifts.start))
          .where(
            and(
              eq(shifts.uid, user.id),
              gte(shifts.start, startTime),
              lt(shifts.start, endTime),
            ),
          )

  let filtered = await filterByPrivileges(user, privileges, history)
  if (!filtered) {
    return ''
  }
  return longerHTML(privileges, filtered)
}

async function filterByPrivileges(
  user: Staff,
  privileges: string,
  history: SelectShift[],
) {
  let filtered: SelectShift[] = []

  for (let shift of history) {
    switch (privileges) {
      case 'superuser':
        filtered.push(shift)
        break
      case 'admin':
        let staff = await findStaff(shift.uid)
        if (!staff) {
          console.error('staff not found', shift)
          continue
        }
        if (staff.display_order <= user.display_order) {
          filtered.push(shift)
        }
        break
      case 'user':
        if (shift.uid === user.id) {
          filtered.push(shift)
        }
        continue
    }
  }

  return filtered
}

history.post('/today', async (c) => {
  return c.html(selectShifts(c, 'today'))
})

history.post('/week', async (c) => {
  return c.html(selectShifts(c, 'week'))
})

history.post('/last7', async (c) => {
  return c.html(selectShifts(c, 'last7'))
})

history.post('/fortnight', async (c) => {
  return c.html(selectShifts(c, 'fortnight'))
})

history.post('/last14', async (c) => {
  return c.html(selectShifts(c, 'last14'))
})

history.post('/month', async (c) => {
  return c.html(selectShifts(c, 'month'))
})

history.post('/last30', async (c) => {
  return c.html(selectShifts(c, 'last30'))
})

history.post('/year', async (c) => {
  return c.html(selectShifts(c, 'year'))
})

export default history
