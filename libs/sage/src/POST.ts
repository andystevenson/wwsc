import { api } from './env'
import { getToken } from './auth'

// GET is a high-order-function that returns a simple get request at single endpoint
// it is a common pattern in the SAGE api

export function POST<Response, Request>(
  endpoint: string,
  code: string,
  request: Request,
) {
  return async function post() {
    console.log(`POST ${endpoint},${code}`, request)
    const token = await getToken(code)

    let url = endpoint.startsWith('/')
      ? `${api}${endpoint}`
      : `${api}/${endpoint}`

    const headers = {
      Authorization: `Bearer ${token.access_token}`,
      'Content-Type': 'application/json',
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    })
    console.log('POST', response.ok, response.status, response.statusText)
    const data = (await response.json()) as Response
    return data
  }
}
