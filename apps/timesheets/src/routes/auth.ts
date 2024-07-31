import { factory } from '../Hono'
import { login, logout, staff, type Staff } from '@wwsc/lib-sumup-pos'
import { isNull, and, eq } from 'drizzle-orm'
import { db, shifts, SelectShift } from '../db/db'

const auth = factory.createApp()

auth.get('/login', async (c) => {
  let passcode = c.req.query('passcode')
  console.log('login', passcode)
  c.header('Cache-Control', 'no-cache, no-store, must-revalidate')

  if (!passcode) {
    c.status(400)
    return c.json({ error: 'passcode required' }, 400)
  }

  let session = c.get('session')
  let user = await findStaff(+passcode)
  let shift: SelectShift | null = null

  if (!user) {
    c.status(401)
    return c.json({ error: 'invalid passcode' }, 401)
  }
  session.set('user', user)

  // check if the user is already clocked in
  let current = await db
    .select()
    .from(shifts)
    .where(and(eq(shifts.uid, user.id), isNull(shifts.end)))

  if (current.length) {
    shift = current[0]
    session.set('shift', shift)
  }

  console.log('user session', user, shift)
  return c.redirect('/user', 301)
})

auth.post('/logout', async (c) => {
  console.log('logout')
  let session = c.get('session')
  session.set('user', null)
  session.deleteSession()
  return c.redirect('/')
})

async function getStaff() {
  try {
    await login()
    let all = await staff()
    await logout()
    return all
  } catch (error) {
    console.error('getStaff', error)
    return []
  }
}

let allStaff: Staff[] = []

async function findStaff(passcode: number) {
  if (!allStaff.length) {
    allStaff = await getStaff()
  }
  return allStaff.find((staff) => staff.passcode === passcode)
}

setTimeout(async () => {
  // refresh the staff list every 60 seconds
  let all = await getStaff()
  allStaff = all
}, 1000 * 60)

export default auth
