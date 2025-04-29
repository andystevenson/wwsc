import { spinner } from '@wwsc/lib-cli'
import { fromTo } from '../src/fromTo'
import { login, logout, sales } from '@wwsc/lib-sumup-pos'
import { writeFileSync, mkdirSync } from 'node:fs'

let { from, to } = fromTo()

await login()

mkdirSync('/var/lib/wwsc/logs', { recursive: true })

type Sale = Awaited<ReturnType<typeof sales>>[number]

export function excludeNonPayments(sales: Sale[]) {
  return sales.filter((sale) => {
    let missing = sale.sales_payments_history.length === 0
    // if (missing) {
    //   console.log('Missing payment', sale.id)
    // }
    return !missing
  })
}

export function excludeReceptionSales(sales: Sale[]) {
  return sales.filter((sale) => {
    let include = sale.register.register_name !== 'Reception'
    return include
  })
}

export function registerSales(register: string, sales: Sale[]) {
  return sales.filter((sale) => {
    let include =
      sale.register.register_name.toLowerCase() === register.toLowerCase()
    return include
  })
}

while (from.isBefore(to)) {
  console.log(from.format('YYYY-MM-DD'))
  const date = from.format('YYYY-MM-DD')
  const directory = `/var/lib/wwsc/logs/${date}`
  mkdirSync(directory, { recursive: true })

  // fetch the sales for the day
  const salesData = await spinner(sales(from), {
    text: 'Fetching sales...',
    successText: 'Sales fetched',
    color: 'green'
  })

  let filteredSales = excludeNonPayments(salesData)
  let receptionSales = registerSales('Reception', filteredSales)
  filteredSales = excludeReceptionSales(salesData)

  if (salesData.length !== filteredSales.length) {
    console.log(`sales: ${salesData.length}, filtered: ${filteredSales.length}`)
  }

  console.log('filteredSales', filteredSales.length, filteredSales[0])
  console.log('receptionSales', receptionSales.length, receptionSales[0])

  writeFileSync(
    `${directory}/reception.json`,
    JSON.stringify(receptionSales, null, 2)
  )
  from = from.add(1, 'day')
}

await logout()
