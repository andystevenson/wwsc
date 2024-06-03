import { fetch } from '@wwsc/lib-util'
let credentials: { token: string } | undefined

export async function login() {
  const authentication = {
    subdomain: process.env.GOODTILL_SUBDOMAIN,
    username: process.env.GOODTILL_USERNAME,
    password: process.env.GOODTILL_PASSWORD,
  }

  const url = 'https://api.thegoodtill.com/api/login'

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(authentication),
  })

  if (response.ok) {
    const json = await response.json()
    credentials = json
    return credentials
  }

  console.log({ authentication })
  throw Error(`sumup login failed [${response.statusText}]`)
}

export function authorization() {
  if (!credentials) throw Error(`sumup credentials require login`)
  const { token } = credentials
  return { Authorization: `Bearer ${token}` }
}

export async function logout() {
  // not logged in so it is a no-op
  if (!credentials) return

  try {
    const url = 'https://api.thegoodtill.com/api/logout'

    const response = await fetch(url, {
      method: 'POST',
      headers: authorization(),
    })
    if (response.ok) {
      const json = await response.json()
      return json
    }
    throw new Error(`sumup logout failed [${response.statusText}]`)
  } catch (error) {
    if (error instanceof Error) {
      console.error(`sumup logout error [${error.message}]`)
    }
    throw error
  }
}

export default { login, logout, authorization }
