import {
  type Sale,
  type SummarySalesItem,
  type SalesPaymentsHistory,
  type ProductId,
} from './Sale.js'
import memoize from 'lodash.memoize'
import { authorization } from './sumup-auth.js'
import { v4 as uuid } from 'uuid'

// ratiosFromPaymentHistory
// provides the ratio of cash, sumup, card, and voucher payments towards the total
// if the total is zero it returns the payment amounts
const ratiosFromPaymentHistory = (
  sale_total: number,
  sales_payments_history: SalesPaymentsHistory[],
) => {
  const cash = sales_payments_history
    .filter((payment) => payment.payment_method === 'CASH')
    .reduce((acc, payment) => acc + +payment.payment_amount, 0)

  const sumup = sales_payments_history
    .filter((payment) => payment.payment_method === 'SUMUP')
    .reduce((acc, payment) => acc + +payment.payment_amount, 0)

  const card = sales_payments_history
    .filter((payment) => payment.payment_method === 'CARD')
    .reduce((acc, payment) => acc + +payment.payment_amount, 0)

  const voucher = sales_payments_history
    .filter((payment) => payment.payment_method === 'VOUCHER')
    .reduce((acc, payment) => acc + +payment.payment_amount, 0)

  const total = +(cash + sumup + card + voucher).toFixed(2)

  const total_ratio = total / sale_total

  return {
    zero_total:
      total === 0
        ? { cash, sumup, card, voucher, total, sale_total, total_ratio }
        : null,
    cash: total === 0 ? 0 : (cash / total) * total_ratio,
    sumup: total === 0 ? 0 : (sumup / total) * total_ratio,
    card: total === 0 ? 0 : (card / total) * total_ratio,
    voucher: total === 0 ? 0 : (voucher / total) * total_ratio,
    total,
    sale_total,
    total_ratio,
  }
}

// zetZeroTotalSalesItems - creates dummy sales items for zero total sales part payments
export const zeroTotalSalesItems = (
  sale: Sale,
  zero_total: {
    cash: number
    sumup: number
    card: number
    voucher: number
    total: number
  },
  items: SummarySalesItem[],
) => {
  const { id, register, staff } = sale

  const salesItem: SummarySalesItem = {
    id: `from-zero-total-${uuid()}`,
    sales_id: id,
    register: register.register_name,
    staff: staff.staff_name,
    product: '!! part payment from zero total sales !!',
    category: 'MISC',
    parent_category: 'MISC',
    quantity: 1,
    unit_price: 0,
    item_notes: 'auto generated',
    created_at: new Date(),
    updated_at: new Date(),
    gross: 0,
    discount: 0,
    total: 0,
    vat: 0,
    net: 0,
    cash: 0,
    sumup: 0,
    card: 0,
    voucher: 0,
  }

  const zero_items: SummarySalesItem[] = []
  const { cash, sumup, card, voucher } = zero_total
  if (cash) {
    const item = structuredClone(salesItem)
    item.unit_price = item.total = item.net = item.cash = cash
    zero_items.push(item)
  }

  if (sumup) {
    const item = structuredClone(salesItem)
    item.unit_price = item.total = item.net = item.sumup = sumup
    zero_items.push(item)
  }

  if (card) {
    const item = structuredClone(salesItem)
    item.unit_price = item.total = item.net = item.card = card
    zero_items.push(item)
  }

  if (voucher) {
    const item = structuredClone(salesItem)
    item.unit_price = item.total = item.net = item.voucher = voucher
    zero_items.push(item)
  }

  if (zero_items.length) {
    items.push(...zero_items)
  }
}

export const dailySalesItems = async (sales: Sale[]) => {
  const items: SummarySalesItem[] = []

  for (const sale of sales) {
    const { id, sales_details, sales_payments_history, register, staff } = sale
    let { sales_items, total: sale_total } = sales_details

    const ratios = ratiosFromPaymentHistory(+sale_total, sales_payments_history)

    const { zero_total } = ratios
    if (zero_total) {
      zeroTotalSalesItems(sale, zero_total, items)
      continue
    }

    // if (sales_payments_history.length > 1 && sales_items.length > 1) {
    //   console.log('multiple payments', id, sales_payments_history.length)
    // }

    let parts: SummarySalesItem[] = []

    for (const item of sales_items) {
      const {
        id,
        product_id,
        quantity,
        price_inc_vat_per_item,
        item_notes,
        created_at,
        updated_at,
        line_total_after_discount,
        line_vat_after_discount,
        line_subtotal_after_discount,
        item_type,
      } = item

      let product = await productFromId(product_id)
      let category = { category_name: 'DELETED' }
      let parent_category = { category_name: 'DELETED' }

      if (product) {
        category = await categoryFromProductId(product_id)
        parent_category = await parentCategoryFromProductId(product_id)
        parent_category = parent_category ? parent_category : category
      }

      const salesItem: SummarySalesItem = {
        id,
        sales_id: item.sales_id,
        register: register.register_name,
        staff: staff.staff_name,
        product: item.product_name,
        category: item_type === 'MISC' ? 'MISC' : category.category_name,
        parent_category:
          item_type === 'MISC' ? 'MISC' : parent_category.category_name,
        quantity,
        unit_price: +price_inc_vat_per_item,
        item_notes,
        created_at,
        updated_at,
        gross: +(quantity * +price_inc_vat_per_item).toFixed(2),
        discount: +(
          +(quantity * +price_inc_vat_per_item).toFixed(2) -
          +line_total_after_discount
        ).toFixed(2),
        total: +line_total_after_discount,
        vat: +line_vat_after_discount,
        net: +line_subtotal_after_discount,
        cash: ratios.cash * +line_total_after_discount,
        sumup: ratios.sumup * +line_total_after_discount,
        card: ratios.card * +line_total_after_discount,
        voucher: ratios.voucher * +line_total_after_discount,
      }

      if (sales_payments_history.length > 1 && sales_items.length > 1) {
        // console.log('item payments', item_ratio, salesItem)
        parts.push(salesItem)
      }

      items.push(salesItem)
    }

    if (sales_payments_history.length > 1 && sales_items.length > 1) {
      const cash = parts.reduce((acc, item) => acc + item.cash, 0)
      const sumup = parts.reduce((acc, item) => acc + item.sumup, 0)
      const card = parts.reduce((acc, item) => acc + item.card, 0)
      const voucher = parts.reduce((acc, item) => acc + item.voucher, 0)
      const totals = {
        cash: +cash.toFixed(2),
        sumup: +sumup.toFixed(2),
        card: +card.toFixed(2),
        voucher: +voucher.toFixed(2),
        total: +(cash + sumup + card + voucher).toFixed(2),
        match: +(cash + sumup + card + voucher).toFixed(2) === ratios.total,
      }

      if (!totals.match) {
        console.log('totals mismatch', parts, totals)
        throw new Error('totals mismatch', { cause: totals })
      }
    }
  }

  return items
}

export const productFromId = async (id: ProductId) => {
  if (!id) return null
  const url = `https://api.thegoodtill.com/api/products/${id}`
  const response = await fetch(url, {
    method: 'GET',
    headers: { ...authorization(), 'content-type': 'application/json' },
  })

  if (response.ok) {
    const json = await response.json()
    return json.data
  }

  return null
}

export const categoryFromId = async (id: ProductId) => {
  if (!id) return null
  const url = `https://api.thegoodtill.com/api/categories/${id}`
  const response = await fetch(url, {
    method: 'GET',
    headers: { ...authorization(), 'content-type': 'application/json' },
  })

  if (response.ok) {
    const json = await response.json()
    return json.data
  }

  return null
}

const mProductFromId = memoize(productFromId)
const mCategoryFromId = memoize(categoryFromId)

export const categoryFromProductId = async (id: ProductId) => {
  if (!id) return null

  const product = await mProductFromId(id)
  if (!product) return null

  const category = await mCategoryFromId(product.category_id)
  return category
}

const mCategoryFromProductId = memoize(categoryFromProductId)

export const parentCategoryFromProductId = async (id: ProductId) => {
  if (!id) return null
  const category = await mCategoryFromProductId(id)
  return category ? category.parent_category : null
}

// // trial

// await login()

// let from = date('2024-02-01')
// while (from.month() === 1) {
//   console.log(from.format('YYYY-MM-DD'))
//   const sales = JSON.parse(
//     readFileSync(`./json/sales-${from.format('YYYY-MM-DD')}.json`, 'utf8'),
//   )
//   await dailySalesItems(sales)
//   from = from.add(1, 'day')
// }

// await logout()
