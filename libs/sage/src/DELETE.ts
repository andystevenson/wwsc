import { api } from './env'
import { getToken } from './auth'

// GET is a high-order-function that returns a simple get request at single endpoint
// it is a common pattern in the SAGE api

export const DELETE = (
  endpoint: string,
  code: string,
  params: { id: string },
) => {
  return async function del() {
    console.log(`DELETE ${endpoint},${code}`, params)
    const token = await getToken(code)

    const { id } = params
    let url = `${api}/${endpoint}/${id}`

    const headers = {
      Authorization: `Bearer ${token.access_token}`,
    }

    const response = await fetch(url, { method: 'DELETE', headers })
    const data = response.ok
    return data
  }
}
