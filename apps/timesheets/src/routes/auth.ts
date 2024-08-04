import { isNull, and, eq } from 'drizzle-orm'
import { factory } from '../hono-factory'
import { findStaff } from '../pos/pos'
import { db, shifts, SelectShift } from '../db/db'
import { lucia, addSessionUser } from '../lucia'

const auth = factory.createApp()

auth.get('/login', async (c) => {
  let passcode = c.req.query('passcode')
  console.log('login', passcode)
  c.header('Cache-Control', 'no-cache, no-store, must-revalidate')

  if (!passcode) {
    c.status(400)
    return c.json({ error: 'passcode required' }, 400)
  }

  let user = await findStaff(+passcode)
  let shift: SelectShift | null = null

  if (!user) {
    c.status(401)
    return c.json({ error: 'invalid passcode' }, 401)
  }

  c.set('user', user)

  // check if the user is already clocked in
  let current = await db
    .select()
    .from(shifts)
    .where(and(eq(shifts.uid, user.id), isNull(shifts.end)))

  if (current.length) {
    shift = current[0]
    c.set('shift', shift)
  }

  let session = await lucia.createSession(user.id, {})
  let cookie = lucia.createSessionCookie(session.id).serialize()
  addSessionUser(user)
  c.header('Set-Cookie', cookie, { append: true })

  c.set('session', session)
  console.log('user session', session, user, shift)
  return c.redirect('/user', 301)
})

auth.post('/logout', async (c) => {
  const session = c.get('session')
  const user = c.get('user')
  const shift = c.get('shift')
  console.log('logout', session, user, shift)

  if (!session || !user) {
    return c.redirect('/')
  }

  await lucia.invalidateSession(session.id)
  let cookie = lucia.createBlankSessionCookie().serialize()
  c.header('Set-Cookie', cookie, { append: true })
  c.set('session', null)
  c.set('user', null)
  c.set('shift', null)
  return c.redirect('/')
})

export default auth
