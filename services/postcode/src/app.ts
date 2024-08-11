import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { prettyJSON } from 'hono/pretty-json'
import { ipRestriction } from 'hono/ip-restriction'
import { trimTrailingSlash } from 'hono/trailing-slash'
import { find } from './getAddress'
import { eq } from 'drizzle-orm'
import { conninfo } from '@wwsc/lib-hono'

const app = new Hono()

// TODO: getAddress has other capabilities like location mapping etc.

import {
  db,
  InsertPostcode,
  insertPostcode,
  SelectPostcode,
  postcodes,
} from '@wwsc/lib-db'
import { dayjs } from '@wwsc/lib-dates'

let whitelist = JSON.parse(process.env.WHITELISTED_IPS || '[]')

app.use(
  '*',
  ipRestriction(conninfo('postcode'), {
    denyList: [],
    allowList: whitelist,
  }),
)
app.use(cors())
app.use(trimTrailingSlash())
app.use(prettyJSON())

app.get('/', async (c) => {
  let postcode = c.req.query('postcode')

  console.log({ postcode })
  if (!postcode) {
    return c.json({ message: 'Missing postcode', ok: false }, 400)
  }

  // remove an whitespace from the postcode
  postcode = postcode.replace(/\s/g, '').toUpperCase()

  let found = await db
    .selectDistinct()
    .from(postcodes)
    .where(eq(postcodes.postcode, postcode))
  if (found.length) {
    // we found a cached result
    let { result } = found[0]
    result = JSON.parse(result)
    console.log('from cache', { result })
    return c.json(result)
  }

  // otherwise, fetch from the API
  let result = await find(postcode)
  if (!result) {
    return c.json({ message: 'Not Found', ok: false }, 404)
  }

  // cache the result
  let record: InsertPostcode = {
    postcode,
    expires: dayjs().add(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
    result: JSON.stringify(result),
  }

  await insertPostcode(record)

  return c.json(result)
})

app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404))

export default app
