import { api } from './env'
import { getToken } from './auth'
import type { Params } from './Types'

// GET is a high-order-function that returns a simple get request at single endpoint
// it is a common pattern in the SAGE api

export function GET<T>(endpoint: string, code: string, params?: Params) {
  return async function get() {
    console.log(`GET ${endpoint},${code},`, params)
    const token = await getToken(code)

    let url = endpoint.startsWith('/')
      ? `${api}${endpoint}`
      : `${api}/${endpoint}`

    if (params) {
      const search = new URLSearchParams(params)
      url = `${url}?${search}`
      console.log(`GET ${endpoint},${url}`)
    }

    const headers = {
      Authorization: `Bearer ${token.access_token}`,
      'Content-Type': 'application/json',
    }

    const response = await fetch(url, { headers })
    const data = (await response.json()) as T
    return data
  }
}
