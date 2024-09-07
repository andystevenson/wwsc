import { spinner } from '@wwsc/lib-cli'
import { fromTo } from './src/fromTo'
import { login, logout, sales, registerClosures } from '@wwsc/lib-sumup-pos'
import type { DailySummary } from '@wwsc/lib-sumup-pos'
import { writeFileSync, mkdirSync } from 'node:fs'
import { writeDailySalesSummaries } from './src/writeDailySalesSummaries'
import { writeDailySalesByPaymentMethod } from './src/writeDailySalesByPaymentMethod'
import { writeDailySalesItems } from './src/writeDailySalesItems'
import { writeDailySalesCategories } from './src/writeDailySalesCategories'
import { writeTillDifferences } from './src/writeTillDifferences'

let { from, to } = fromTo()
const start = from

const payouts: DailySummary[] = []

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

while (from.isBefore(to)) {
  console.log(from.format('YYYY-MM-DD'))
  const date = from.format('YYYY-MM-DD')
  const directory = `/var/lib/wwsc/logs/${date}`
  mkdirSync(directory, { recursive: true })

  // fetch the sales for the day
  const salesData = await spinner(sales(from), {
    text: 'Fetching sales...',
    successText: 'Sales fetched',
    color: 'green',
  })

  const filteredSales = excludeNonPayments(salesData)

  if (salesData.length !== filteredSales.length) {
    console.log(`Sales: ${salesData.length}, filtered: ${filteredSales.length}`)
  }

  // summarize the sales
  let summaries = await writeDailySalesSummaries(filteredSales, directory)

  // save the payment methods
  let paymentMethods = await writeDailySalesByPaymentMethod(
    summaries,
    directory,
  )

  // save the sales items
  let salesItems = await writeDailySalesItems(filteredSales, directory)

  // save the sales categories
  const categories = await writeDailySalesCategories(
    summaries,
    salesItems,
    directory,
  )

  const closures = await registerClosures(from)

  const differences = await writeTillDifferences(closures.data, directory)

  payouts.push(paymentMethods)

  from = from.add(1, 'day')
}

// write the collection of payouts to a file
const file = `/var/lib/wwsc/logs/${start.format('YYYY-MM')}-payouts.json`
writeFileSync(file, JSON.stringify(payouts, null, 2))

await logout()
