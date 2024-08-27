import { dailySalesSummaries } from '@wwsc/lib-sumup-pos'

import type { Sale } from '@wwsc/lib-sumup-pos'
import { writeFileSync } from 'node:fs'
import { db, sales, insertSale, insertPayment } from '@wwsc/lib-db'
import { eq } from 'drizzle-orm'

export const writeDailySalesSummaries = async (
  salesData: Sale[],
  directory: string,
) => {
  let file = `${directory}/sales.json`
  writeFileSync(file, JSON.stringify(salesData, null, 2))

  const salesSummaries = await dailySalesSummaries(salesData)
  file = `${directory}/sales-summaries.json`
  writeFileSync(file, JSON.stringify(salesSummaries, null, 2))

  type SalesSummary = (typeof salesSummaries)[number]
  const uniqueSales: SalesSummary[] = []

  for (const sale of salesSummaries) {
    let exists = await db.select().from(sales).where(eq(sales.id, sale.id))
    if (exists.length) {
      continue
    }
    uniqueSales.push(sale)
    await insertSale(sale)
    for (const payment of sale.payments) {
      await insertPayment(payment)
    }
  }

  console.log(
    `Unique sales: ${uniqueSales.length} ${salesSummaries.length} ${salesData.length}`,
  )
  return uniqueSales
}
