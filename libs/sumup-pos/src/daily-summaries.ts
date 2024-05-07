import type {
  SummarySalesItem,
  Scope,
  SaleSummary,
  DailySummarySales,
} from './Sale'
import { Scopes } from './Sale'
import { v4 as uuid } from 'uuid'
import { dayjs, type DayOfWeek } from '@wwsc/dates'

export const dailySalesSummaries = (
  sales: SaleSummary[],
  items: SummarySalesItem[],
) => {
  const summaries: DailySummarySales[] = []
  summaries.push(...ALL(sales, items))
  summaries.push(...REGISTER(sales, items))
  summaries.push(...STAFF(sales, items))
  summaries.push(...PRODUCT(sales, items))
  summaries.push(...PARENT_CATEGORY(sales, items))
  summaries.push(...CATEGORY(sales, items))
  summaries.push(...SUMUP(sales, items))
  summaries.push(...CASH(sales, items))
  summaries.push(...CARD(sales, items))
  summaries.push(...VOUCHER(sales, items))
  return summaries
}

const DefaultSummary: DailySummarySales = {
  id: `dss_${uuid()}`,
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

const addToSummary = (summary: DailySummarySales, item: SummarySalesItem) => {
  summary.quantity = +(summary.quantity + item.quantity).toFixed(2)
  summary.gross = +(summary.gross + item.gross).toFixed(2)
  summary.discount = +(summary.discount + item.discount).toFixed(2)
  summary.total = +(summary.total + item.total).toFixed(2)
  summary.vat = +(summary.vat + item.vat).toFixed(2)
  summary.net = +(summary.net + item.net).toFixed(2)
  summary.cash = +(summary.cash + item.cash).toFixed(2)
  summary.sumup = +(summary.sumup + item.sumup).toFixed(2)
  summary.card = +(summary.card + item.card).toFixed(2)
  summary.voucher = +(summary.voucher + item.voucher).toFixed(2)
}

const ALL = (sales: SaleSummary[], items: SummarySalesItem[]) => {
  const summary: DailySummarySales = structuredClone(DefaultSummary)
  if (items.length === 0) return [summary]

  summary.id = `dss_${uuid()}`
  summary.day = dayjs(items[0].updated_at).format('dddd') as DayOfWeek
  summary.date = dayjs(items[0].updated_at).startOf('day').toDate()
  summary.scope = 'ALL'
  summary.name = 'ALL'

  const salesSeen = new Set<string>()

  for (const item of items) {
    const { sales_id } = item
    let sale = null
    if (!salesSeen.has(sales_id)) {
      sale = sales.find((s) => s.id === sales_id)
      salesSeen.add(sales_id)
    }

    // do something
    addToSummary(summary, item)
    summary.fees = +(summary.fees + (sale ? sale.fees : 0)).toFixed(2)
  }

  return [summary]
}

const REGISTER = (sales: SaleSummary[], items: SummarySalesItem[]) => {
  type Registers = { [key: string]: DailySummarySales }
  const registers: Registers = {}

  for (const item of items) {
    const { register } = item
    let summary = registers[register]

    if (!summary) {
      registers[register] = structuredClone(DefaultSummary)

      summary = registers[register]
      summary.id = `dss_${uuid()}`
      summary.day = dayjs(item.updated_at).format('dddd') as DayOfWeek
      summary.date = dayjs(item.updated_at).startOf('day').toDate()
      summary.scope = 'REGISTER'
      summary.name = register
    }
    // do something

    addToSummary(summary, item)
  }

  return Object.values(registers)
}

const STAFF = (sales: SaleSummary[], items: SummarySalesItem[]) => {
  type Staff = { [key: string]: DailySummarySales }
  const people: Staff = {}

  for (const item of items) {
    const { staff } = item
    let summary = people[staff]

    if (!summary) {
      people[staff] = structuredClone(DefaultSummary)
      summary = people[staff]
      summary.id = `dss_${uuid()}`
      summary.day = dayjs(item.updated_at).format('dddd') as DayOfWeek
      summary.date = dayjs(item.updated_at).startOf('day').toDate()
      summary.scope = 'STAFF'
      summary.name = staff
    }
    // do something
    addToSummary(summary, item)
  }

  return Object.values(people)
}

const PRODUCT = (sales: SaleSummary[], items: SummarySalesItem[]) => {
  type Product = { [key: string]: DailySummarySales }
  const products: Product = {}

  for (const item of items) {
    const { product } = item
    let summary = products[product]

    if (!summary) {
      products[product] = structuredClone(DefaultSummary)
      summary = products[product]
      summary.id = `dss_${uuid()}`
      summary.day = dayjs(item.updated_at).format('dddd') as DayOfWeek
      summary.date = dayjs(item.updated_at).startOf('day').toDate()
      summary.scope = 'PRODUCT'
      summary.name = product
    }
    // do something
    addToSummary(summary, item)
  }

  return Object.values(products)
}

const PARENT_CATEGORY = (sales: SaleSummary[], items: SummarySalesItem[]) => {
  type Category = { [key: string]: DailySummarySales }
  const categories: Category = {}

  for (const item of items) {
    const { parent_category } = item
    let summary = categories[parent_category]

    if (!summary) {
      categories[parent_category] = structuredClone(DefaultSummary)
      summary = categories[parent_category]
      summary.id = `dss_${uuid()}`
      summary.day = dayjs(item.updated_at).format('dddd') as DayOfWeek
      summary.date = dayjs(item.updated_at).startOf('day').toDate()
      summary.scope = 'PARENT_CATEGORY'
      summary.name = parent_category
    }
    // do something
    addToSummary(summary, item)
  }

  return Object.values(categories)
}

const CATEGORY = (sales: SaleSummary[], items: SummarySalesItem[]) => {
  type Category = { [key: string]: DailySummarySales }
  const categories: Category = {}

  for (const item of items) {
    const { category } = item
    let summary = categories[category]

    if (!summary) {
      categories[category] = structuredClone(DefaultSummary)
      summary = categories[category]
      summary.id = `dss_${uuid()}`
      summary.day = dayjs(item.updated_at).format('dddd') as DayOfWeek
      summary.date = dayjs(item.updated_at).startOf('day').toDate()
      summary.scope = 'CATEGORY'
      summary.name = category
    }
    // do something
    addToSummary(summary, item)
  }

  return Object.values(categories)
}

const SUMUP = (sales: SaleSummary[], items: SummarySalesItem[]) => {
  type Sumup = { [key: string]: DailySummarySales }
  const sumups: Sumup = {}

  for (const item of items) {
    const { sumup } = item
    let summary = sumups[sumup]

    if (!summary) {
      sumups[sumup] = structuredClone(DefaultSummary)
      summary = sumups[sumup]
      summary.id = `dss_${uuid()}`
      summary.day = dayjs(item.updated_at).format('dddd') as DayOfWeek
      summary.date = dayjs(item.updated_at).startOf('day').toDate()
      summary.scope = 'SUMUP'
      summary.name = 'SUMUP'
    }
    // do something

    if (item.sumup) addToSummary(summary, item)
  }

  return Object.values(sumups)
}

const CASH = (sales: SaleSummary[], items: SummarySalesItem[]) => {
  type Cash = { [key: string]: DailySummarySales }
  const cashs: Cash = {}

  for (const item of items) {
    const { cash } = item
    let summary = cashs[cash]

    if (!summary) {
      cashs[cash] = structuredClone(DefaultSummary)
      summary = cashs[cash]
      summary.id = `dss_${uuid()}`
      summary.day = dayjs(item.updated_at).format('dddd') as DayOfWeek
      summary.date = dayjs(item.updated_at).startOf('day').toDate()
      summary.scope = 'CASH'
      summary.name = 'CASH'
    }
    // do something

    if (item.cash) addToSummary(summary, item)
  }

  return Object.values(cashs)
}

const CARD = (sales: SaleSummary[], items: SummarySalesItem[]) => {
  type Card = { [key: string]: DailySummarySales }
  const cards: Card = {}

  for (const item of items) {
    const { card } = item
    let summary = cards[card]

    if (!summary) {
      cards[card] = structuredClone(DefaultSummary)
      summary = cards[card]
      summary.id = `dss_${uuid()}`
      summary.day = dayjs(item.updated_at).format('dddd') as DayOfWeek
      summary.date = dayjs(item.updated_at).startOf('day').toDate()
      summary.scope = 'CARD'
      summary.name = 'CARD'
    }
    // do something

    if (item.card) addToSummary(summary, item)
  }

  return Object.values(cards)
}

const VOUCHER = (sales: SaleSummary[], items: SummarySalesItem[]) => {
  type Voucher = { [key: string]: DailySummarySales }
  const vouchers: Voucher = {}

  for (const item of items) {
    const { voucher } = item
    let summary = vouchers[voucher]

    if (!summary) {
      vouchers[voucher] = structuredClone(DefaultSummary)
      summary = vouchers[voucher]
      summary.id = `dss_${uuid()}`
      summary.day = dayjs(item.updated_at).format('dddd') as DayOfWeek
      summary.date = dayjs(item.updated_at).startOf('day').toDate()
      summary.scope = 'VOUCHER'
      summary.name = 'VOUCHER'
    }
    // do something

    if (item.voucher) addToSummary(summary, item)
  }

  return Object.values(vouchers)
}
