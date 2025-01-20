import { stripe, Stripe } from '../src/stripe'
import { dayjs } from '@wwsc/lib-dates'
import { db, payouts, desc, sql } from '../src/db'
import { InsertPayout, PayoutStatus } from '../src/db'

let numberFormat = new Intl.NumberFormat('en-GB', {
  currency: 'GBP',
  style: 'currency'
})

function gbp(amount: number) {
  return numberFormat.format(amount / 100)
}

async function lastPayout() {
  let lastPayout = await db.query.payouts.findFirst({
    orderBy: desc(payouts.date)
  })

  return lastPayout
}

async function insertStripePayout(payout: Stripe.Payout) {
  let { id, amount, arrival_date, status } = payout

  let date = dayjs.unix(arrival_date).format('YYYY-MM-DD')

  let insertPayout: InsertPayout = {
    id,
    date,
    amount: amount / 100,
    status: status as PayoutStatus
  }

  await db
    .insert(payouts)
    .values(insertPayout)
    .onConflictDoUpdate({ target: [payouts.id], set: insertPayout })

  console.log('inserted payout', date, status, gbp(amount))
}

async function sync() {
  let last = await lastPayout()

  let from = last ? last.date : '2024-01-01'
  let to = dayjs().add(1, 'day').format('YYYY-MM-DD')

  let fromUnix = dayjs(from).unix()
  let toUnix = dayjs(to).unix()

  console.log('from', from, 'to', to)
  let count = 0
  for await (const payout of stripe.payouts.list({
    arrival_date: { gte: fromUnix, lte: toUnix },
    expand: ['data.destination']
  })) {
    await insertStripePayout(payout)
    count++
  }

  console.log(count, 'payouts inserted')
}

async function main() {
  await sync()
}

await main()
