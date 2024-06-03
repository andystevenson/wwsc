import { api } from './env'
import { fetch } from '@wwsc/lib-util'

export function POST<Request, Response>(
  endpoint: string,
  bearer: string,
  request: Request,
) {
  return async function post() {
    let url = endpoint.startsWith('/')
      ? `${api}${endpoint}`
      : `${api}/${endpoint}`

    const headers = {
      Authorization: `Bearer ${bearer}`,
      'Content-Type': 'application/json',
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    })

    if (!response.ok)
      throw new Error('sage-api-error:POST', {
        cause: { reason: `${response.statusText}`, status: response.status },
      })

    const data = (await response.json()) as Response
    return data
  }
}
