import { readFileSync } from 'fs'
import { date } from '@wwsc/dates'

let from = date('2024-02-01').startOf('day')

while (from.month() === 1) {
  const fromFormat = from.format('YYYY-MM-DD')
  console.log(fromFormat)

  const summaries = JSON.parse(
    readFileSync(`./json/summaries-${fromFormat}.json`),
    'utf-8',
  )

  for (const summary of summaries) {
    const payments = summary.payments
    const total = payments.reduce((acc, payment) => acc + payment.amount, 0)
    if (summary.total !== total) {
      console.log(`Total: ${summary.total} !== ${total}, ${summary.id}`)
    }
  }

  from = from.add(1, 'day')
}
