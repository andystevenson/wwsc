import type { SummarySalesItem, SaleSummary, DailySalesCategory } from './Sale'
import { nanoid } from 'nanoid'
import { dayjs, type DayOfWeek } from '@wwsc/lib-dates'
import {
  SingleCategory,
  MultipleCategory,
  addToCategory,
  DefaultCategory,
} from './salesCategoryGenerators'

import Big from 'big.js'

export const dailySalesCategories = (
  sales: SaleSummary[],
  items: SummarySalesItem[],
) => {
  // ALL is a special category that includes all sales
  const summaries: DailySalesCategory[] = []
  summaries.push(...ALL(sales, items))

  // The following categories are ones that can generate a single summary
  for (const scope of ['SUMUP', 'CASH', 'CARD', 'VOUCHER']) {
    const key = scope.toLowerCase() as keyof SummarySalesItem
    summaries.push(...SingleCategory(scope, (item) => item[key] !== 0, items))
  }

  // Bank charges are a special category for Sage that is generated from sales
  summaries.push(...BANK_CHARGES(sales))

  // The following categories are ones that can generate multiple summaries
  // primarily used for Sales Analysis
  for (const s of [
    'REGISTER',
    'STAFF',
    'PRODUCT',
    'PARENT_CATEGORY',
    'CATEGORY',
  ]) {
    const scope = s
    const key = scope.toLowerCase() as keyof SummarySalesItem
    summaries.push(...MultipleCategory(scope, key, items))
  }

  return summaries
}

const ALL = (sales: SaleSummary[], items: SummarySalesItem[]) => {
  const summary: DailySalesCategory = structuredClone(DefaultCategory)
  if (items.length === 0) return [summary]

  summary.id = `dcs_${nanoid()}`
  summary.day = dayjs(items[0].updated_at).format('dddd') as DayOfWeek
  summary.date = dayjs(items[0].updated_at).startOf('day').toDate()
  summary.scope = 'ALL'
  summary.name = 'ALL'

  const salesSeen = new Set<string>()

  for (const item of items) {
    const { sales_id } = item
    let sale: SaleSummary | undefined
    if (!salesSeen.has(sales_id)) {
      sale = sales.find((s) => s.id === sales_id)
      salesSeen.add(sales_id)
    }

    // do something
    addToCategory(summary, item)
    if (sale?.refunds) continue
    summary.fees = Big(summary.fees)
      .plus(sale ? sale.fees : 0)
      .round(2)
      .toNumber()
  }

  return [summary]
}

const BANK_CHARGES = (sales: SaleSummary[]) => {
  if (sales.length === 0) return []

  let summary = structuredClone(DefaultCategory)

  summary.id = `dcs_${nanoid()}`
  summary.day = dayjs(sales[0].time).format('dddd') as DayOfWeek
  summary.date = dayjs(sales[0].time).startOf('day').toDate()
  summary.scope = 'BANK_CHARGES'
  summary.name = 'BANK_CHARGES'

  for (const sale of sales) {
    if (sale.fees)
      summary.fees = Big(summary.fees).plus(sale.fees).round(2).toNumber()
  }

  return [summary]
}
