import { spinner } from '@wwsc/lib-cli'
import { fromTo } from './src/fromTo'
import { login, logout, sales } from '@wwsc/lib-sumup-pos'
import type { DailySummary } from '@wwsc/lib-sumup-pos'
import { writeFileSync, mkdirSync } from 'node:fs'
import { writeDailySalesSummaries } from './src/writeDailySalesSummaries'
import { writeDailySalesByPaymentMethod } from './src/writeDailySalesByPaymentMethod'
import { writeDailySalesItems } from './src/writeDailySalesItems'
import { writeDailySalesCategories } from './src/writeDailySalesCategories'

let { from, to } = fromTo()
const start = from

const payouts: DailySummary[] = []

await login()

mkdirSync('./logs', { recursive: true })

while (from.isBefore(to)) {
  console.log(from.format('YYYY-MM-DD'))
  const date = from.format('YYYY-MM-DD')
  const directory = `./logs/${date}`
  mkdirSync(directory, { recursive: true })

  // fetch the sales for the day
  const salesData = await spinner(sales(from), {
    text: 'Fetching sales...',
    successText: 'Sales fetched',
    color: 'green',
  })

  // summarize the sales
  let summaries = await writeDailySalesSummaries(salesData, directory)

  // save the payment methods
  let paymentMethods = await writeDailySalesByPaymentMethod(
    summaries,
    directory,
  )

  // save the sales items
  let salesItems = await writeDailySalesItems(salesData, directory)

  // save the sales categories
  const categories = await writeDailySalesCategories(
    summaries,
    salesItems,
    directory,
  )

  payouts.push(paymentMethods)

  from = from.add(1, 'day')
}

// write the collection of payouts to a file
const file = `./logs/${start.format('YYYY-MM')}-payouts.json`
writeFileSync(file, JSON.stringify(payouts, null, 2))

await logout()
