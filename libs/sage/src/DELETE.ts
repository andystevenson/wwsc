import { api } from './env'
import { fetch } from '@wwsc/lib-util'

export const DELETE = async (
  endpoint: string,
  bearer: string,
  params: { id: string },
) => {
  const { id } = params
  let url = `${api}/${endpoint}/${id}`

  const headers = {
    Authorization: `Bearer ${bearer}`,
  }

  const response = await fetch(url, { method: 'DELETE', headers })
  if (!response.ok)
    throw new Error('sage-api-error:DELETE', {
      cause: { reason: `${response.statusText}`, status: response.status },
    })

  const data = response.ok
  return data
}
