import {
  type Sale,
  type SummarySalesItem,
  type SalesPaymentsHistory,
  type ProductId,
  SalesItem,
} from './Sale.js'
import memoize from 'lodash.memoize'
import { authorization } from './sumup-auth.js'
import { Big } from 'big.js'

const DP = 6

export type PaymentHistoryRatio = {
  cash: number
  sumup: number
  card: number
  voucher: number
  ratio: number
  actual_total: number
  sale_total: number
  total_ratio: number
}

export const zeroPaymentToRatios = (
  actual_total: number,
  sale_total: number,
  total_ratio: number,
) => {
  let ratios: PaymentHistoryRatio = {
    cash: 0,
    sumup: 0,
    card: 0,
    voucher: 0,
    ratio: 0,
    actual_total,
    sale_total,
    total_ratio,
  }

  return ratios
}

export const paymentToRatios = (
  payment: SalesPaymentsHistory,
  actual_total: number,
  sale_total: number,
  category_total: number,
  total_ratio: number,
  factor: number,
) => {
  let amount = Big(payment.payment_amount).round(DP).toNumber()
  let ratio = Big(amount)
    .div(category_total)
    .times(total_ratio)
    .times(factor)
    .round(DP)
    .toNumber()

  let ratios: PaymentHistoryRatio = {
    cash: payment.payment_method === 'CASH' ? amount : 0,
    sumup: payment.payment_method === 'SUMUP' ? amount : 0,
    card: payment.payment_method === 'CARD' ? amount : 0,
    voucher: payment.payment_method === 'VOUCHER' ? amount : 0,
    ratio,
    actual_total,
    sale_total,
    total_ratio,
  }

  return ratios
}

export const zeroPaymentsToRatios = (
  negatives: SalesPaymentsHistory[],
  negatives_total: number,
  positives: SalesPaymentsHistory[],
  positives_total: number,
  actual_total: number,
  sale_total: number,
  total_ratio: number,
) => {
  let factor = 0.5
  let negative_ratios = negatives.map((payment) =>
    paymentToRatios(
      payment,
      actual_total,
      sale_total,
      negatives_total,
      total_ratio,
      factor,
    ),
  )

  let positive_ratios = positives.map((payment) =>
    paymentToRatios(
      payment,
      actual_total,
      sale_total,
      positives_total,
      total_ratio,
      factor,
    ),
  )

  return [...negative_ratios, ...positive_ratios]
}

export const paymentsToRatios = (
  payments: SalesPaymentsHistory[],
  actual_total: number,
  sale_total: number,
  total_ratio: number,
) => {
  let factor = 1
  let ratios = payments.map((payment) =>
    paymentToRatios(
      payment,
      actual_total,
      sale_total,
      actual_total,
      total_ratio,
      factor,
    ),
  )

  return ratios
}

export const paymentRatiosFromHistory = (sale: Sale) => {
  const { sales_payments_history, sales_details } = sale
  const { total: sale_total } = sales_details

  const sale_total_rounded = Big(sale_total).round(DP).toNumber()

  let total = sales_payments_history.reduce(
    (acc, next) => Big(acc).plus(next.payment_amount).round(DP).toNumber(),
    0,
  )

  let negatives = sales_payments_history.filter(
    (payment) => Big(payment.payment_amount).round(DP).toNumber() < 0,
  )

  let negatives_total = negatives.reduce(
    (acc, next) => Big(acc).plus(next.payment_amount).round(DP).toNumber(),
    0,
  )

  let positives = sales_payments_history.filter(
    (payment) => Big(payment.payment_amount).round(DP).toNumber() > 0,
  )

  let positives_total = positives.reduce(
    (acc, next) => Big(acc).plus(next.payment_amount).round(DP).toNumber(),
    0,
  )

  let zeros = sales_payments_history.filter((payment) =>
    Big(payment.payment_amount).eq(0),
  )

  let balanced = Big(negatives_total).plus(positives_total).eq(0)
  let mismatch = !Big(total).eq(sale_total)
  let total_ratio = Big(sale_total_rounded).eq(0)
    ? 1
    : Big(total).div(sale_total).round(DP).toNumber()

  let ratios: PaymentHistoryRatio[] = []
  ratios = balanced
    ? zeroPaymentsToRatios(
        negatives,
        negatives_total,
        positives,
        positives_total,
        total,
        sale_total_rounded,
        total_ratio,
      )
    : paymentsToRatios(
        [...negatives, ...positives],
        total,
        sale_total_rounded,
        total_ratio,
      )

  let zero_ratios = zeros.map(() =>
    zeroPaymentToRatios(total, sale_total_rounded, total_ratio),
  )

  return [...ratios, ...zero_ratios]
}

export const salesItemsFromPayments = async (
  ratios: PaymentHistoryRatio[],
  sale: Sale,
  item: SalesItem,
) => {
  let parts: SummarySalesItem[] = []

  const { id: sales_id, sales_payments_history, register, staff } = sale

  const {
    id,
    product_id,
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

  let n = 0
  let nPayments = sales_payments_history.length
  for (const paymentRatio of ratios) {
    // generate a sales item for each payment
    const {
      cash,
      sumup,
      card,
      voucher,
      ratio,
      actual_total,
      sale_total,
      total_ratio,
    } = paymentRatio

    const itemRatio = Big(actual_total).eq(0)
      ? 0
      : Big(line_total_after_discount)
          .times(total_ratio)
          .div(actual_total)
          .toNumber()

    const quantity = Big(item.quantity).times(ratio).round(DP).toNumber()
    const unit_price = Big(price_inc_vat_per_item).round(DP).toNumber()
    const gross = Big(quantity).times(unit_price).round(DP).toNumber()
    const total = Big(line_total_after_discount)
      .times(ratio)
      .round(DP)
      .toNumber()
    const discount = Big(gross).minus(total).round(DP).toNumber()
    const vat = Big(line_vat_after_discount).times(ratio).round(DP).toNumber()
    const net = Big(line_subtotal_after_discount)
      .times(ratio)
      .round(DP)
      .toNumber()

    const salesItem: SummarySalesItem = {
      id: nPayments === 1 ? id : `from-payment-${id}.${n}`,
      sales_id,
      register: register.register_name,
      staff: staff.staff_name,
      product: item.product_name,
      category: item_type === 'MISC' ? 'MISC' : category.category_name,
      parent_category:
        item_type === 'MISC' ? 'MISC' : parent_category.category_name,
      quantity,
      unit_price,
      item_notes,
      created_at,
      updated_at,
      gross,
      discount,
      total,
      vat,
      net,
      cash: Big(cash).times(itemRatio).round(DP).toNumber(),
      sumup: Big(sumup).times(itemRatio).round(DP).toNumber(),
      card: Big(card).times(itemRatio).round(DP).toNumber(),
      voucher: Big(voucher).times(itemRatio).round(DP).toNumber(),
    }

    // if (id === '00ee9969-0e61-428c-a2fe-6d86096e2a60') {
    //   console.log('salesItem 00ee9969-0e61-428c-a2fe-6d86096e2a60', {
    //     n,
    //     paymentRatio,
    //     item,
    //     salesItem,
    //   })
    // }
    n = n + 1

    parts.push(salesItem)
  }

  // if (parts.length > 1) console.log('multiple parts', parts)
  return parts
}

const checkPartsMatchesTotal = (
  ratios: PaymentHistoryRatio[],
  saleTotal: number,
  parts: SummarySalesItem[],
) => {
  const cash = parts.reduce(
    (acc, item) => Big(acc).plus(item.cash).toNumber(),
    0,
  )
  const sumup = parts.reduce(
    (acc, item) => Big(acc).plus(item.sumup).toNumber(),
    0,
  )
  const card = parts.reduce(
    (acc, item) => Big(acc).plus(item.card).toNumber(),
    0,
  )
  const voucher = parts.reduce(
    (acc, item) => Big(acc).plus(item.voucher).toNumber(),
    0,
  )

  const total = Big(cash)
    .plus(sumup)
    .plus(card)
    .plus(voucher)
    .round(DP)
    .toNumber()

  const totals = {
    cash,
    sumup,
    card,
    voucher,
    total,
    match: Big(total).round(2).eq(Big(saleTotal).round(2)),
    diff: Big(total).minus(saleTotal).toNumber(),
  }

  if (!totals.match) {
    console.log('totals mismatch', total, saleTotal, totals, parts, ratios)
    throw new Error('totals mismatch', { cause: totals })
  }
}

export const dailySalesItems = async (sales: Sale[]) => {
  const items: SummarySalesItem[] = []

  for (const sale of sales) {
    const { sales_details } = sale
    let { sales_items } = sales_details

    let parts: SummarySalesItem[] = []

    const ratios = paymentRatiosFromHistory(sale)

    for (const item of sales_items) {
      if (ratios.length === 0) {
        console.error('no ratios', { sale, item })
      }

      const salesItemParts = await salesItemsFromPayments(ratios, sale, item)
      const total_ratio = ratios[0].total_ratio
      checkPartsMatchesTotal(
        ratios,
        Big(item.line_total_after_discount)
          .times(total_ratio)
          .round(DP)
          .toNumber(),
        salesItemParts,
      )

      parts.push(...salesItemParts)
    }

    const actual_total = ratios[0].actual_total
    checkPartsMatchesTotal(
      ratios,
      Big(actual_total).round(DP).toNumber(),
      parts,
    )
    items.push(...parts)
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

// memoize the lookups as they will be repeated often
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
