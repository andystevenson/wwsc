/// <reference lib="dom" />
import { authorization } from './sumup-auth'
import { dayjs } from '@wwsc/lib-dates'
import type { Sale } from './Sale'

/** sales - fetch sales from SumUp POS tills - known previously as goodtill
 * @param from - the start date for the sales
 * @param to - the end date for the sales
 *
 * @returns - a list of sales
 *
 * by default, the sales are fetched for the current day or for the rest of the day specified by the 'from' date
 * Note: must be surrounded by a login() logout() pair
 */
export async function sales(
  from = dayjs().startOf('day'),
  to = from.add(1, 'day'),
) {
  const format = 'YYYY-MM-DD HH:mm:ss'

  const limit = 50
  let offset = 0
  const params = new URLSearchParams({
    from: from.format(format),
    to: to.format(format),
    limit: `${limit}`,
    offset: `${offset}`,
  })

  let allSales: Sale[] = []
  let allSalesFetched = false
  do {
    const url = `https://api.thegoodtill.com/api/external/get_sales_details?${params.toString()}`
    const response = await fetch(url, {
      method: 'GET',
      headers: { ...authorization(), 'content-type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`sumup sales failed [${response.statusText}]`)
    }

    // we have a valid response
    const json = await response.json()
    allSales = allSales.concat(json.data)
    const length = json.data.length
    allSalesFetched = length === 0

    if (!allSalesFetched) {
      offset = Number(params.get('offset')) + limit
      params.set('offset', `${offset}`)
    }
  } while (!allSalesFetched)

  return allSales
}
