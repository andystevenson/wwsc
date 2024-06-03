import { Predicate, SummarySalesItem, DailySalesCategory } from './Sale'
import { nanoid } from 'nanoid'
import { dayjs, DayOfWeek } from '@wwsc/lib-dates'
import Big from 'big.js'

export const DefaultCategory: DailySalesCategory = {
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

export function SingleCategory<
  S extends string,
  P extends Predicate,
  SSI extends SummarySalesItem,
>(s: S, p: P, items: SSI[]) {
  if (items.length === 0) return []

  let summary = structuredClone(DefaultCategory)

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
      addToCategory(summary, item)
    }
  }

  return count ? [summary] : []
}

export function MultipleCategory<
  S extends string,
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
      collection[id] = structuredClone(DefaultCategory)

      summary = collection[id]
      summary.id = `dcs_${nanoid()}`
      summary.day = dayjs(item.updated_at).format('dddd') as DayOfWeek
      summary.date = dayjs(item.updated_at).startOf('day').toDate()
      summary.scope = s
      summary.name = id
    }
    // do something

    addToCategory(summary, item)
  }

  return Object.values(collection)
}

export const addToCategory = (
  category: DailySalesCategory,
  item: SummarySalesItem,
) => {
  category.quantity = Big(category.quantity)
    .plus(item.quantity)
    .round(2)
    .toNumber()
  category.gross = Big(category.gross).plus(item.gross).round(2).toNumber()
  category.discount = Big(category.discount)
    .plus(item.discount)
    .round(2)
    .toNumber()
  category.total = Big(category.total).plus(item.total).round(2).toNumber()
  category.vat = Big(category.vat).plus(item.vat).round(2).toNumber()
  category.net = Big(category.net).plus(item.net).round(2).toNumber()
  category.cash = Big(category.cash).plus(item.cash).round(2).toNumber()
  category.sumup = Big(category.sumup).plus(item.sumup).round(2).toNumber()
  category.card = Big(category.card).plus(item.card).round(2).toNumber()
  category.voucher = Big(category.voucher)
    .plus(item.voucher)
    .round(2)
    .toNumber()
}
