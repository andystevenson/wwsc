import type {
  SummarySalesItem,
  Scope,
  SaleSummary,
  DailySalesCategory,
} from './Sale'
import { SageScopePredicates } from './Sale'
import { nanoid } from 'nanoid'
import { dayjs, type DayOfWeek } from '@wwsc/lib-dates'
import Big from 'big.js'

type Predicate = (s: SummarySalesItem) => boolean

function SingleCategory<
  S extends Scope,
  P extends Predicate,
  SSI extends SummarySalesItem,
>(s: S, p: Predicate, items: SSI[]) {
  if (items.length === 0) return []

  let summary = structuredClone(DefaultSummary)

  summary.id = `dcs_${nanoid()}`
  summary.day = dayjs(items[0].updated_at).format('dddd') as DayOfWeek
  summary.date = dayjs(items[0].updated_at).startOf('day').toDate()
  summary.scope = s
  summary.name = s

  let count = 0
  for (const item of items) {
    let add = p(item)
    if (add) {
      count = count + 1
      addToSummary(summary, item)
    }
  }

  return count ? [summary] : []
}

function MultipleCategory<
  S extends Scope,
  F extends keyof SummarySalesItem,
  SSI extends SummarySalesItem,
>(s: S, f: F, items: SSI[]) {
  type Collection = { [key: string]: DailySalesCategory }
  const collection: Collection = {}

  for (const item of items) {
    const field = item[f]
    const id = field as string
    let summary = collection[id]

    if (!summary) {
      collection[id] = structuredClone(DefaultSummary)

      summary = collection[id]
      summary.id = `dcs_${nanoid()}`
      summary.day = dayjs(item.updated_at).format('dddd') as DayOfWeek
      summary.date = dayjs(item.updated_at).startOf('day').toDate()
      summary.scope = s
      summary.name = id
    }
    // do something

    addToSummary(summary, item)
  }

  return Object.values(collection)
}

export const dailySalesCategories = (
  sales: SaleSummary[],
  items: SummarySalesItem[],
) => {
  // ALL is a special category that includes all sales
  const summaries: DailySalesCategory[] = []
  summaries.push(...ALL(sales, items))

  // The following categories are ones that can generate a single summary
  for (const s of ['SUMUP', 'CASH', 'CARD', 'VOUCHER']) {
    const scope = s as Scope
    const key = scope.toLowerCase() as keyof SummarySalesItem
    summaries.push(...SingleCategory(scope, (item) => item[key] !== 0, items))
  }

  // The following categories are ones that have complex predicates related to Sage

  Object.entries(SageScopePredicates).forEach(([category, predicate]) => {
    if (category === 'BANK_CHARGES') return
    summaries.push(...SingleCategory(category as Scope, predicate, items))
  })

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
    const scope = s as Scope
    const key = scope.toLowerCase() as keyof SummarySalesItem
    summaries.push(...MultipleCategory(scope, key, items))
  }

  return summaries
}

const DefaultSummary: DailySalesCategory = {
  id: `dcs_${nanoid()}`,
  day: dayjs().format('dddd') as DayOfWeek,
  date: dayjs().toDate(),
  scope: 'ALL',
  name: 'ALL',
  quantity: 0,
  gross: 0,
  discount: 0,
  total: 0,
  vat: 0,
  net: 0,
  cash: 0,
  sumup: 0,
  card: 0,
  voucher: 0,
  fees: 0,
}

const addToSummary = (summary: DailySalesCategory, item: SummarySalesItem) => {
  summary.quantity = Big(summary.quantity)
    .plus(item.quantity)
    .round(2)
    .toNumber()
  summary.gross = Big(summary.gross).plus(item.gross).round(2).toNumber()
  summary.discount = Big(summary.discount)
    .plus(item.discount)
    .round(2)
    .toNumber()
  summary.total = Big(summary.total).plus(item.total).round(2).toNumber()
  summary.vat = Big(summary.vat).plus(item.vat).round(2).toNumber()
  summary.net = Big(summary.net).plus(item.net).round(2).toNumber()
  summary.cash = Big(summary.cash).plus(item.cash).round(2).toNumber()
  summary.sumup = Big(summary.sumup).plus(item.sumup).round(2).toNumber()
  summary.card = Big(summary.card).plus(item.card).round(2).toNumber()
  summary.voucher = Big(summary.voucher).plus(item.voucher).round(2).toNumber()
}

const ALL = (sales: SaleSummary[], items: SummarySalesItem[]) => {
  const summary: DailySalesCategory = structuredClone(DefaultSummary)
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
    addToSummary(summary, item)
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

  let summary = structuredClone(DefaultSummary)

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
