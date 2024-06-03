/**
 * This function is used to post daily takings to Sage & record the transactions to the database
 *
 * */

import { dayjs } from '@wwsc/lib-dates'
import { deleteOtherPayment } from '@wwsc/lib-sage'

import { db, sageTransactions } from '@wwsc/lib-db'
import { and, gte, lt } from 'drizzle-orm'

export const reverseMonthlyTakings = async (bearer: string, date: string) => {
  const start = dayjs(date).startOf('month')
  const from = start.format('YYYY-MM-DD')
  const to = start.add(1, 'month').format('YYYY-MM-DD')

  const transactions = await db
    .select()
    .from(sageTransactions)
    .where(and(gte(sageTransactions.date, from), lt(sageTransactions.date, to)))

  if (transactions.length === 0) {
    return { deleted: [], transactions: [] }
  }

  for (let transaction of transactions) {
    await deleteOtherPayment(bearer, transaction.transactionId)
  }

  const deleted = await db
    .delete(sageTransactions)
    .where(and(gte(sageTransactions.date, from), lt(sageTransactions.date, to)))

  return { deleted, transactions: transactions.map((t) => t.id) }
}
