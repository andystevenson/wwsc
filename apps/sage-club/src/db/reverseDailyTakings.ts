/**
 * This function is used to post daily takings to Sage & record the transactions to the database
 *
 * */

import { deleteOtherPayment } from '@wwsc/lib-sage'

import { db, sageTransactions } from '@wwsc/lib-db'
import { eq } from 'drizzle-orm'
import sage from '../routes/sage'

export const reverseDailyTakings = async (bearer: string, date: string) => {
  type DateType = typeof sageTransactions.date
  const transactions = await db
    .select()
    .from(sageTransactions)
    .where(eq(sageTransactions.date, date))

  if (transactions.length === 0) {
    return { deleted: [], transactions: [] }
  }

  for (let transaction of transactions) {
    await deleteOtherPayment(bearer, transaction.transactionId)
  }

  const deleted = await db
    .delete(sageTransactions)
    .where(eq(sageTransactions.date, date))

  return { deleted, transactions: transactions.map((t) => t.id) }
}
