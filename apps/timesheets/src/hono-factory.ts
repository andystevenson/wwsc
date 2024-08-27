import { Hono, type Context } from 'hono'
import { createFactory } from 'hono/factory'
import { getCookie } from 'hono/cookie'
import { lucia, User, Session } from './lucia'
import { findStaff } from './pos/pos'
import { db, shifts, eq, and, isNull } from './db/db'
import { Shift } from './db/Types'
import { isBankHoliday } from './utilities/isBankHoliday'
import { dayjs } from '@wwsc/lib-dates'

export type WithSession = {
  Variables: {
    user: User | null
    session: Session | null
    shift: Shift | null
    isBankHoliday: boolean
  }
}

const factory = createFactory<WithSession>()

const protectedPage = factory.createMiddleware(async (c, next) => {
  c.header('Cache-Control', 'no-cache, no-store, must-revalidate')
  let user = c.get('user')
  if (!user) {
    console.error('unauthorized')
    return c.redirect('/')
  }

  await next()
})

const sessionMiddleware = factory.createMiddleware(async (c, next) => {
  const sessionId = getCookie(c, lucia.sessionCookieName) ?? null
  if (!sessionId) {
    c.set('user', null)
    c.set('shift', null)
    c.set('session', null)
    c.set('isBankHoliday', false)
    return next()
  }

  let { session, user } = await lucia.validateSession(sessionId)

  if (session && session.fresh) {
    // use `header()` instead of `setCookie()` to avoid TS errors
    c.header('Set-Cookie', lucia.createSessionCookie(session.id).serialize(), {
      append: true,
    })
  }
  if (!session) {
    c.header('Set-Cookie', lucia.createBlankSessionCookie().serialize(), {
      append: true,
    })
  }

  if (user) {
    let staff = await findStaff(user.id)
    let current = await db
      .select()
      .from(shifts)
      .where(and(eq(shifts.uid, user.id), isNull(shifts.end)))

    if (current.length) {
      c.set('shift', current[0])
    }

    staff ? c.set('user', staff) : c.set('user', null)
  }
  c.set('session', session)
  let today = dayjs().format('YYYY-MM-DD')
  c.set('isBankHoliday', await isBankHoliday(today))
  return next()
})

export { Hono, Context, sessionMiddleware, factory, protectedPage }
