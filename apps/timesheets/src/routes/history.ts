import { factory, protectedPage, Context } from '../hono-factory'
import { dayjs } from '@wwsc/lib-dates'
import { longerHTML } from '../utilities/shiftHTML'
import { type Staff } from '@wwsc/lib-sumup-pos'
import { db, shifts } from '../db/db'
import { and, gte, lt, eq, asc } from 'drizzle-orm'

const history = factory.createApp()

history.use(protectedPage)

type DateRange =
  | 'today'
  | 'week'
  | 'last7'
  | 'fortnight'
  | 'last14'
  | 'month'
  | 'last30'
  | 'year'

const dateRange = (range: DateRange) => {
  let today = dayjs().startOf('day')
  let tomorrow = today.add(1, 'day').startOf('day')
  let startTime = today.format('YYYY-MM-DDTHH:mm')
  let endTime = tomorrow.format('YYYY-MM-DDTHH:mm')

  switch (range) {
    case 'today':
      break
    case 'week':
      startTime =
        today.day() === 0 // sunday
          ? today.subtract(6, 'day').format('YYYY-MM-DDTHH:mm')
          : today.startOf('week').add(1, 'day').format('YYYY-MM-DDTHH:mm')
      break
    case 'last7':
      startTime = today.subtract(7, 'day').format('YYYY-MM-DDTHH:mm')
      break
    case 'fortnight':
      startTime =
        today.day() === 0 // sunday
          ? today.subtract(13, 'day').format('YYYY-MM-DDTHH:mm')
          : today
              .startOf('week')
              .subtract(1, 'week')
              .add(1, 'day')
              .format('YYYY-MM-DDTHH:mm')
      break
    case 'last14':
      startTime = today.subtract(14, 'day').format('YYYY-MM-DDTHH:mm')
      break
    case 'month':
      startTime = today.startOf('month').format('YYYY-MM-DDTHH:mm')
      break
    case 'last30':
      startTime = today.subtract(30, 'day').format('YYYY-MM-DDTHH:mm')
      break
    case 'year':
      startTime = today.startOf('year').format('YYYY-MM-DDTHH:mm')
      break
  }

  console.log('range', range, startTime, endTime)
  return { startTime, endTime }
}

const selectShifts = async (c: Context, range: DateRange) => {
  let user = c.get('user') as Staff
  let superuser = user.display_order === 127

  let { startTime, endTime } = dateRange(range)

  let history = superuser
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

  return longerHTML(superuser, history)
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
