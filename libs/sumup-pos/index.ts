import { date } from '@wwsc/dates'
import { login, logout } from './src/sumup-auth'
import { sales, summarizeSales, dailySalesByMethod } from './src/sales'
import { writeFileSync } from 'node:fs'

await login()
let from = date('2024-02-01')

const payouts = []

while (from.month() === 1) {
  const salesData = await sales(from)
  console.log('sales', from.format(), salesData.length)

  let file = `./json/sales-${from.format('YYYY-MM-DD')}.json`
  writeFileSync(file, JSON.stringify(salesData, null, 2))

  const summaries = await summarizeSales(salesData)
  file = `./json/summaries-${from.format('YYYY-MM-DD')}.json`
  writeFileSync(file, JSON.stringify(summaries, null, 2))

  const dailyByMethod = await dailySalesByMethod(summaries)
  file = `./json/daily-by-method-${from.format('YYYY-MM-DD')}.json`
  writeFileSync(file, JSON.stringify(dailyByMethod, null, 2))

  payouts.push(dailyByMethod)

  from = from.add(1, 'day')
}

const file = `./json/payouts-${from.format('YYYY-MM')}.json`
writeFileSync(file, JSON.stringify(payouts, null, 2))

await logout()
