import { date, dayjs, type Dayjs } from '@wwsc/lib-dates'
import type {
  Summary,
  TransactionHistory,
  Transaction,
  SimplifiedTransaction,
} from './Transaction'
import { writeFileSync } from 'node:fs'
import dotenv from 'dotenv'

dotenv.config()

const headers = {
  Authorization: `Bearer ${process.env.SUMUP_API_KEY}`,
}

export const dailyTransactionHistory = async (date: Dayjs) => {
  const API = process.env.SUMUP_API_HISTORY

  const limit = 100

  const params = new URLSearchParams({
    limit: `${limit}`,
    changes_since: `${date.format('YYYY-MM-DD')}`,
  })
  let href = `${params}`
  let fetchMore = true

  let transactions: Summary[] = []

  do {
    let URL = `${API}?${href}`
    const response = await fetch(URL, { headers })
    if (!response.ok) {
      throw new Error(`dailyTransactionHistory failed`, {
        cause: { status: response.status, reason: response.statusText },
      })
    }

    const history = (await response.json()) as TransactionHistory
    transactions = transactions.concat(
      history.items
        .map(
          ({
            transaction_id,
            transaction_code,
            status,
            timestamp,
            type,
            amount,
            refunded_amount,
          }) => ({
            id: transaction_id,
            transaction_code,
            status,
            timestamp,
            type,
            amount,
            refunded_amount,
          }),
        )
        .filter((item) => {
          const timestamp = dayjs(item.timestamp)
          const sameDay = date.isSame(timestamp, 'day')
          return sameDay
        }),
    )

    // ! determine if we've fetched all the transactions for the day
    const fetched = history.items.length
    href = history.links.length > 0 ? history.links[0]?.href : ''
    const lastTransaction = history.items[fetched - 1]
    const lastTransactionDate = dayjs(lastTransaction.timestamp)
    const onSameDay = lastTransactionDate.isSame(date, 'day')

    fetchMore = !!href && fetched === limit && onSameDay
  } while (fetchMore)

  const file = `./json/history-${date.format('YYYY-MM-DD')}.json`
  console.log(file, transactions.length)
  writeFileSync(file, JSON.stringify(transactions, null, 2))

  return transactions
}

const checkSimplified = (simplified: SimplifiedTransaction[]) => {
  simplified.forEach((transaction) => {
    const { status, simple_status, t_status, timestamp, t_timestamp } =
      transaction
    if (status !== t_status)
      console.log(`status: ${status} !== t_status: ${t_status}`)
    if (timestamp !== t_timestamp)
      console.log(`timestamp: ${timestamp} !== t_timestamp: ${t_timestamp}`)
  })
}

export const getTransactionByCode = async (
  transaction_code: string,
): Promise<Transaction> => {
  const API = process.env.SUMUP_API_TRANSACTIONS

  const params = new URLSearchParams({ transaction_code })
  const URL = `${API}?${params}`
  // console.log(`getTransaction: ${transaction_code}`)
  const response = await fetch(URL, { headers })
  if (!response.ok) {
    throw new Error(`getTransaction failed`, {
      cause: { status: response.status, reason: response.statusText },
    })
  }

  let t = (await response.json()) as Transaction
  return t
}

export const transactionsFromSummaries = async (
  from: Dayjs,
  summaries: Summary[],
) => {
  const API = process.env.SUMUP_API_TRANSACTIONS

  let transactions: Transaction[] = []

  for (const summary of summaries) {
    const { id } = summary
    const params = new URLSearchParams({ id })
    const URL = `${API}?${params}`
    const response = await fetch(URL, { headers })
    if (!response.ok) {
      throw new Error(`transactionsFromSummaries failed`, {
        cause: { status: response.status, reason: response.statusText },
      })
    }

    const transaction = (await response.json()) as Transaction
    // console.log(`${URL}`, transaction.events?.length)
    transaction.summary = summary
    transactions.push(transaction)
  }

  const simplified = transactions
    .filter((t) => t.status !== 'FAILED')
    .map(
      ({
        simple_status,
        status: t_status,
        card: t_card,
        client_transaction_id,
        events,
        timestamp: t_timestamp,
        summary,
      }) => {
        let fee_amount = 0
        if (events) {
          if (events.length > 1)
            console.log(`events: ${events.length}`, { events })
          for (const event of events) {
            fee_amount = fee_amount + event.fee_amount
          }
        }
        let transaction: SimplifiedTransaction = {
          id: summary ? summary.id : '',
          transaction_code: summary ? summary.transaction_code : '',
          status: summary ? summary.status : 'SUCCESSFUL',
          timestamp: summary ? summary.timestamp : new Date(),
          type: summary ? summary.type : 'PAYMENT',
          amount: summary ? summary.amount : 0,
          simple_status,
          t_status,
          t_timestamp,
          client_transaction_id,
          fee_amount,
          t_card: t_card?.type,
          refunded_amount: summary?.refunded_amount,
        }
        return transaction
      },
    )

  let count = simplified
    .filter(({ simple_status }) => simple_status === 'PAID_OUT')
    .reduce((count, next) => {
      count = count + 1
      return count
    }, 0)

  let total = simplified
    .filter(({ simple_status }) => simple_status === 'PAID_OUT')
    .reduce((sum, next) => {
      sum = sum + next.amount
      return sum
    }, 0)
  total = +total.toFixed(2)

  let fees = simplified
    .filter(({ simple_status }) => simple_status === 'PAID_OUT')
    .reduce((sum, next) => {
      sum = next.fee_amount ? sum + next.fee_amount : sum
      return sum
    }, 0)
  fees = +fees.toFixed(2)

  let refunds = simplified
    .filter(({ refunded_amount }) => refunded_amount !== 0)
    .reduce((sum, next) => {
      sum = next.refunded_amount ? sum + next.refunded_amount : sum
      return sum
    }, 0)
  refunds = +refunds.toFixed(2)

  const result = { transactions, count, total, fees, refunds }
  let file = `./json/simplified-${from.format('YYYY-MM-DD')}.json`
  writeFileSync(file, JSON.stringify(simplified, null, 2))

  file = `./json/transactions-${from.format('YYYY-MM-DD')}.json`
  writeFileSync(file, JSON.stringify(result, null, 2))

  return result
}
