import { Hono } from 'hono'
import env from '../utilities/env'

const params = new URLSearchParams({
  filter: env.SAGE_API_VERSION,
  client_id: env.SAGE_CLIENT_ID,
  response_type: env.SAGE_RESPONSE_TYPE,
  redirect_uri: env.SAGE_REDIRECT_URI,
  scope: env.SAGE_SCOPE,
  state: env.SAGE_STATE_SECRET,
  country: env.SAGE_COUNTRY,
})

const url = `${env.SAGE_AUTH_URL}?${params}`

const login = new Hono()

login.get('/', (c) => {
  c.header('Content-Type', 'application/json')
  c.header('Access-Control-Allow-Origin', '*')
  return c.redirect(url)
})

export default login
