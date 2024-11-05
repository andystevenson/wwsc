import { api } from './env'
import type { Params } from './Types'
import { fetch } from '@wwsc/lib-util'

// GET is a high-order-function that returns a simple get request at single endpoint
// it is a common pattern in the SAGE api

export function GET<T>(endpoint: string, bearer: string, params?: Params) {
  return async function get() {
    let url = endpoint.startsWith('/')
      ? `${api}${endpoint}`
      : `${api}/${endpoint}`

    if (params) {
      const search = new URLSearchParams(params)
      url = `${url}?${search}`
    }

    const headers = {
      Authorization: `Bearer ${bearer}`,
      'Content-Type': 'application/json',
    }

    const response = await fetch(url, { headers })

    if (!response.ok)
      throw new Error('sage-api-error:GET', {
        cause: { reason: `${response.statusText}`, status: response.status },
      })

    const data = (await response.json()) as T
    return data
  }
}

export async function get(endpoint: string, bearer: string, params?: Params) {
  let getData = GET<any>(endpoint, bearer, params)
  return getData()
}
