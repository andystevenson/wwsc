import { isNull, eq } from 'drizzle-orm'
import { db, shifts, type InsertShift } from '../db'
import { dayjs } from '@wwsc/lib-dates'

export async function autoClockout() {
  const now = dayjs()
  const shiftsToClockout = await db
    .select()
    .from(shifts)
    .where(isNull(shifts.end))

  for (const shift of shiftsToClockout) {
    let id = shift.id
    let start = dayjs(shift.start)
    let diff = now.diff(start, 'minutes')
    // @ts-ignore
    let duration = dayjs.duration(diff, 'minutes')

    let auto: InsertShift['clockedout'] = 'auto'
    if (duration.days() > 0) {
      let end = start.add(1, 'day').subtract(1, 'minute') // 24 hours minus 1 minute
      let shiftEnd = {
        start: start.format('YYYY-MM-DDTHH:mm'),
        end: end.format('YYYY-MM-DDTHH:mm'),
        duration: '23:59',
        notes: 'automatically clocked out after 24 hours',
        clockedout: auto,
      }

      // duration of a shift cannot be more than 24 hours, auto clockout
      let clockedOut = await db
        .update(shifts)
        .set(shiftEnd)
        .where(eq(shifts.id, id))
        .returning()
      console.log('auto clocked out shift', clockedOut)
    }
  }
}

// run it on startup

setInterval(autoClockout, 1000 * 60) // every 10 minutes
