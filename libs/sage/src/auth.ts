/// <reference lib="dom" />

import * as env from './env'
import bcrypt from 'bcrypt'

const salt = await bcrypt.genSalt()

// store all the live sessions
export type Token = {
  refresh_token: string
  expires_in: number
  refresh_token_expires_in: number
}

export type Session = {
  from: string
  code: string
  country: string
  state: string
  token: Token | undefined
  user: any
}

export type Sessions = {
  [key: string]: Session
}

let sessions: Sessions = {}

const headers = {
  method: 'POST',
  'Content-Type': 'application/x-www-form-urlencoded',
  Allow: 'application/json',
}

export const getToken = async (code: string) => {
  // if we have a live token, use it
  // but if we have a new code... then get a new token

  const hash = await bcrypt.hash(code, salt)
  console.log(`getToken ${code} ${hash} ${Object.keys(sessions).length}`)
  if (hash in sessions) {
    if (sessions[hash].code !== code) {
      throw Error('invalid-session', {
        cause: { reason: 'getToken(code) called with invalid code' },
      })
    }
    console.log('returning cached token')
    return sessions[hash].token
  }

  // otherwise we have to ask for a new token

  if (!code)
    throw Error('null-session', {
      cause: { reason: 'getToken(code) called with null value' },
    })

  const { client_id, client_secret, grant_type, redirect_uri, accessTokenUrl } =
    env

  const params = new URLSearchParams({
    client_id,
    client_secret,
    code,
    grant_type,
    redirect_uri,
  })

  const response = await fetch(accessTokenUrl, {
    method: 'POST',
    headers,
    body: `${params}`,
  })

  if (response.ok) {
    const json = await response.json()
    return json
  }

  throw Error('sage-api-error', {
    cause: { reason: `${response.statusText}`, status: response.status },
  })
}

export const refreshToken = async (session: Session) => {
  if (!session.token) throw Error('no-token', { cause: { reason: 'no token' } })

  const { client_id, client_secret, accessTokenUrl } = env
  const grant_type = `refresh_token`
  const refresh_token = session.token?.refresh_token as string

  const params = new URLSearchParams({
    client_id,
    client_secret,
    grant_type,
    refresh_token,
  })

  const response = await fetch(accessTokenUrl, {
    method: 'POST',
    headers,
    body: `${params}`,
  })

  const newToken = await response.json()

  session.token = newToken
  return session
}

export const revokeToken = async (code: string) => {
  const { client_id, client_secret, revokeTokenUrl } = env
  if (!revokeTokenUrl)
    throw Error('no-revoke-token-url', { cause: { reason: 'no url' } })

  const hash = await bcrypt.hash(code, salt)

  // if the session does not exist, simply ignore the request
  if (!(hash in sessions)) return

  const token = sessions[hash].token?.refresh_token as string

  const params = new URLSearchParams({
    client_id,
    client_secret,
    token,
  })

  const response = await fetch(revokeTokenUrl, {
    method: 'POST',
    headers,
    body: `${params}`,
  })

  const success = await response.json()
  delete sessions[hash]
  console.log('revokeToken', success)

  return
}

const scheduleRefresh = (session: Session) => {
  // schedule the token refresh 90% of the way through its elapsed time (which is in seconds)
  if (!session.token) throw Error('no-token', { cause: { reason: 'no token' } })

  const time = Math.floor(session.token.expires_in * 1000 * 0.9)
  const hash = session.from

  console.log(`schedule refresh of ${hash} in ${time}`)
  setTimeout(async () => {
    if (hash in sessions) {
      const { code, country, state, token } = await refreshToken(session)
      if (!token) throw Error('no-token', { cause: { reason: 'no token' } })

      await saveSession(code, country, state, token, session.user)
    }
  }, time)
}

export const scheduleRevoke = async (code: string, token: Token) => {
  const timeout = Math.floor(token.refresh_token_expires_in * 1000 * 0.9)
  setTimeout(async () => {
    await revokeToken(code)
  }, timeout)
}

export const saveSession = async (
  code: string,
  country: string,
  state: string,
  token: Token,
  user: string,
) => {
  // the first time a session is created.... set a timeout to revoke the refresh token
  // and delete the session making the user log in again.

  const hash = await bcrypt.hash(code, salt)

  if (!(hash in sessions)) {
    // it is a new session
    scheduleRevoke(code, token)
  }

  sessions[hash] = {
    from: hash,
    code,
    country,
    state,
    token,
    user,
  }

  console.log('saveSession', Object.keys(sessions).length, code, hash)

  // refresh access token...
  scheduleRefresh(sessions[hash])

  return sessions[hash]
}

export const saveSessionUser = async (code: string, user: string) => {
  const hash = await bcrypt.hash(code, salt)
  if (hash in sessions) {
    sessions[hash].user = user
    return sessions[hash]
  }

  return null
}

export const getSessionUser = async (code: string) => {
  const hash = await bcrypt.hash(code, salt)
  if (hash in sessions) {
    console.log('getSessionUser cached')
    return sessions[hash].user
  }

  return null
}
