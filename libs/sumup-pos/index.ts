import { dayjs } from '@wwsc/dates'
import { login, logout } from './src/sumup-auth'
import { sales, summarizeSales, dailySalesByMethod } from './src/sales'
import { type DailySummary } from './src/Sale'
import { dailySalesItems } from './src/sales-items'
import { writeFileSync, mkdirSync } from 'node:fs'
import { oraPromise as spinner } from 'ora'

await login()

let start = dayjs('2024-04').startOf('month')
let end = start.add(1, 'month')

let from = start

const payouts: DailySummary[] = []

while (from.isBefore(end)) {
  console.log(from.format('YYYY-MM-DD'))
  const date = from.format('YYYY-MM-DD')
  const directory = `./json/${date}`
  mkdirSync(directory, { recursive: true })

  const salesData = await spinner(sales(from), {
    text: 'Fetching sales...',
    successText: 'Sales fetched',
    color: 'green',
  })

  let file = `${directory}/sales.json`
  writeFileSync(file, JSON.stringify(salesData, null, 2))

  const summaries = await summarizeSales(salesData)
  file = `${directory}/summaries.json`
  writeFileSync(file, JSON.stringify(summaries, null, 2))

  const dailyByMethod = await dailySalesByMethod(summaries)
  file = `${directory}/daily.json`
  writeFileSync(file, JSON.stringify(dailyByMethod, null, 2))

  const salesItems = await spinner(dailySalesItems(salesData), {
    text: 'Generating sales items...',
    successText: 'Sales items generated',
    color: 'green',
  })

  file = `${directory}/items.json`
  writeFileSync(file, JSON.stringify(salesItems, null, 2))

  payouts.push(dailyByMethod)

  from = from.add(1, 'day')
}

const file = `./json/${start.format('YYYY-MM')}-payouts.json`
writeFileSync(file, JSON.stringify(payouts, null, 2))

await logout()
