import { dayjs } from '@wwsc/lib-dates'
import { authorization } from './auth'
// get all the register closures between the 2 dates (from, to)
export const registerClosures = async (
  from = dayjs().subtract(1, 'day').startOf('day'),
  to = from.add(1, 'day'),
) => {
  try {
    const format = 'DD/MM/YYYY hh:mm A'
    const daterange = `${from.format(format)} - ${to.format(format)}`

    const params = new URLSearchParams({ daterange })
    // const url = `https://api.thegoodtill.com/api/register_closures`
    const url = `https://api.thegoodtill.com/api/register_closures?${params}`
    // log({ url, params })
    const response = await fetch(url, {
      method: 'GET',
      headers: { ...authorization(), 'content-type': 'application/json' },
    })

    if (response.ok) {
      const json = await response.json()
      return json
    }

    throw Error(`registers failed [${response.statusText}]`)
  } catch (e) {
    if (!(e instanceof Error)) throw e
    console.error(`registers failed [${e.message}]`)
    throw e
  }
}

export type RegisterClosure = {
  id: string
  register_id: string
  register_name: string
  staff_id: string
  staff_name: string
  time_from: string
  time_to: string
  notes: string
  primary_register: number
  consolidate_register: number
  cash_balance: number
  expected_cash_balance: number
  cash_float: number
  payments: RegisterPayment[]
}

export type RegisterPayment = {
  method: string
  expected: string
  counted: string
}
