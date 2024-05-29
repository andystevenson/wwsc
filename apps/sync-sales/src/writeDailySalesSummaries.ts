import { dailySalesSummaries } from '@wwsc/lib-sumup-pos'

import type { Sale } from '@wwsc/lib-sumup-pos'
import { writeFileSync } from 'node:fs'
import { insertSale, insertPayment } from '@wwsc/lib-db'

export const writeDailySalesSummaries = async (
  salesData: Sale[],
  directory: string,
) => {
  let file = `${directory}/sales.json`
  writeFileSync(file, JSON.stringify(salesData, null, 2))

  const salesSummaries = await dailySalesSummaries(salesData)
  file = `${directory}/sales-summaries.json`
  writeFileSync(file, JSON.stringify(salesSummaries, null, 2))

  for (const sale of salesSummaries) {
    // await insertSale(sale)
    for (const payment of sale.payments) {
      // await insertPayment(payment)
    }
  }

  return salesSummaries
}
