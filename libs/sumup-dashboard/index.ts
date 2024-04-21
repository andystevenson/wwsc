import { date } from '@wwsc/dates'
import {
  dailyTransactionHistory,
  transactionsFromSummaries,
} from './dist/index.mjs'
import { writeFileSync } from 'node:fs'
async function run() {
  console.log('running')
  let from = date('2024-02-01')
  type Payout = {
    count: number
    date: string
    total: number
    fees: number
    refunds: number
  }
  const payouts: Array<Payout> = []
  while (from.month() === 1) {
    console.log(from.format('YYYY-MM-DD'))
    const summaries = await dailyTransactionHistory(from)
    console.log(from.format('YYYY-MM-DD'), summaries.length)
    const transactions = await transactionsFromSummaries(from, summaries)
    const { count, total, fees, refunds } = transactions
    const payout = {
      date: from.format('YYYY-MM-DD'),
      count,
      total,
      fees,
      refunds,
    }
    console.log(payout)
    payouts.push(payout)
    from = from.add(1, 'day')
  }
  payouts.forEach((payout, index) => {
    if (index === 0) return
    if (payout.refunds === 0) return
    const previous = payouts[index - 1]
    previous.count = previous.count + 1
    previous.total = previous.total + payout.refunds
  })

  const file = `./json/payouts-${from.format('YYYY-MM-DD')}.json`
  writeFileSync(file, JSON.stringify(payouts, null, 2))
}

run()
