import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const sageTransactions = sqliteTable('sageTransactions', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  createdAt: text('created_at')
    .default(sql<string>`(CURRENT_TIMESTAMP)`)
    .notNull(),
  transactionId: text('transaction_id').notNull(),
  user: text('user').notNull(),
  date: text('date').notNull(),
  ledger: text('ledger').notNull(),
  content: text('content').notNull(),
})

export type InsertSageTransaction = typeof sageTransactions.$inferInsert
export type SelectSageTransaction = typeof sageTransactions.$inferSelect
