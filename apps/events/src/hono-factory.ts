import { Hono, type Context } from 'hono'
import { createFactory } from 'hono/factory'
import { getCookie } from 'hono/cookie'
import { lucia, User, Session } from './lucia'

export type WithSession = {
  Variables: {
    user: User | null
    session: Session | null
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
    c.set('session', null)
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
    // stuff to do with user
  }
  c.set('session', session)
  return next()
})

export { Hono, Context, sessionMiddleware, factory, protectedPage }
