#!/usr/bin/env node
import { authorization } from './sumup-auth.js'
import { getTransactionByCode } from '@wwsc/sumup-dashboard'
import { date } from '@wwsc/dates'
import {
  type Sale,
  type PaymentMethod,
  type CardBrand,
  type EntryMode,
} from './Sale.js'

// sales details between the from - to dates
// note: must be call login() to run this.
export async function sales(
  from = date().startOf('day'),
  to = from.add(1, 'day'),
) {
  const format = 'YYYY-MM-DD HH:mm:ss'

  const limit = 50
  let offset = 0
  const params = new URLSearchParams({
    from: from.format(format),
    to: to.format(format),
    limit: `${limit}`,
    offset: `${offset}`,
  })

  let allSales: Sale[] = []
  let allSalesFetched = false
  do {
    const url = `https://api.thegoodtill.com/api/external/get_sales_details?${params.toString()}`
    const response = await fetch(url, {
      method: 'GET',
      headers: { ...authorization(), 'content-type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`sumup sales failed [${response.statusText}]`)
    }

    // we have a valid response
    const json = await response.json()
    allSales = allSales.concat(json.data)
    const length = json.data.length
    allSalesFetched = length === 0

    if (!allSalesFetched) {
      offset = Number(params.get('offset')) + limit
      params.set('offset', `${offset}`)
    }
  } while (!allSalesFetched)

  return allSales
}

export type PaymentHistory = {
  id: string
  method: PaymentMethod
  time: Date
  amount: number
  fees: number
  card: CardBrand
  entry: EntryMode
  transaction_code: string
}

export type SaleSummary = {
  id: string
  register: string
  staff: string
  time: Date
  total_before_discount: number
  discount: number
  total: number
  vat: number
  net: number
  fees: number // filled in later
  refunds: number
  payments: Array<PaymentHistory>
}

export const summarizeSales = async (sales: Sale[]) => {
  let summaries = sales.map((sale) => {
    const {
      id,
      sales_date_time,
      sales_details,
      sales_payments_history,
      sales_payments_card_history,
      register,
      staff,
    } = sale

    const { total_before_line_discount, total, total_vat, total_ex_vat } =
      sales_details

    const payments = sales_payments_history.map((payment) => {
      const {
        id,
        payment_date_time: time,
        payment_method: method,
        payment_amount,
      } = payment

      const summary: PaymentHistory = {
        id,
        method,
        time,
        amount: +payment_amount,
        fees: 0,
        card: null,
        entry: '',
        transaction_code: '',
      }
      return summary
    })

    payments.forEach((payment) => {
      const { method, id } = payment
      if (method === 'CASH') return
      const cardPayment = sales_payments_card_history.find(
        (history) => history.sales_payment_id === id,
      )
      if (!cardPayment) {
        console.warn(`no ${method} payment history`, payment)
        return
      }

      payment.card = cardPayment.card_brand
      payment.entry = cardPayment.entry_mode
      payment.transaction_code = cardPayment.reference_number
    })

    return {
      id,
      register: register.register_name,
      staff: staff.staff_name,
      time: sales_date_time,
      total_before_discount: +total_before_line_discount,
      discount: +(+total_before_line_discount - +total).toFixed(2),
      total: +total,
      vat: +total_vat,
      net: +total_ex_vat,
      fees: 0, // filled in later
      refunds: +total < 0 ? +(+total * -1).toFixed(2) : 0,
      payments,
    }
  })

  // fill in the fees for SUMUP transactions
  for (const summary of summaries) {
    for (const payment of summary.payments) {
      if (payment.method !== 'SUMUP' && payment.method !== 'CARD') continue

      const transaction_code = payment.transaction_code

      if (!transaction_code) {
        console.warn('no transaction code', payment)
        continue
      }

      const transaction = await getTransactionByCode(transaction_code)
      if (transaction.events) {
        for (const event of transaction.events) {
          summary.fees += event.fee_amount
          payment.fees += event.fee_amount
        }
      }
    }
  }

  return summaries
}

export type PayoutSummary = {
  count: number
  total_before_discount: number
  discount: number
  total: number
  vat: number
  net: number
  fees: number
  refunds: number
  transactions: Set<string>
}

const DefaultPayoutSummary = {
  count: 0,
  total_before_discount: 0,
  discount: 0,
  total: 0,
  vat: 0,
  net: 0,
  fees: 0,
  refunds: 0,
  transactions: new Set(),
}

export type DailySummary = {
  date: string
  SUMUP: PayoutSummary
  CASH: PayoutSummary
  CARD: PayoutSummary
  VOUCHER: PayoutSummary
}

export const dailySalesByMethod = async (summaries: SaleSummary[]) => {
  const dailySummary = {
    date: summaries[0]?.time,
    SUMUP: structuredClone(DefaultPayoutSummary),
    CASH: structuredClone(DefaultPayoutSummary),
    CARD: structuredClone(DefaultPayoutSummary),
    VOUCHER: structuredClone(DefaultPayoutSummary),
  }

  for (const summary of summaries) {
    for (const payment of summary.payments) {
      const method = payment.method
      let n = 0
      let payout = dailySummary[method]

      payout.count++

      const ratio =
        summary.total > 0 || summary.total < 0
          ? payment.amount / summary.total
          : 0

      // super important to understand this

      if (ratio === 0) {
        n = payout.total_before_discount
        n += payment.amount
        payout.total_before_discount = +n.toFixed(2)

        //! discounts do not apply to 0 value sales

        n = payout.total
        n += payment.amount
        payout.total = +n.toFixed(2)

        //! vat does not apply to 0 value sales

        //! net is adjusted by the full value of the payment in a zero value sale
        n = payout.net
        n += payment.amount
        payout.net = +n.toFixed(2)

        //! fees may still apply in a zero value sale
        n = payout.fees
        n += payment.fees
        payout.fees = +n.toFixed(2)

        //! refunds apply if the payment is negative
        if (payment.amount < 0) {
          n = payout.refunds
          n += Math.abs(payment.amount)
          payout.refunds = +n.toFixed(2)
        }

        if (method === 'SUMUP') {
          payout.transactions.add(payment.transaction_code) // unique transactions
          if (payment.amount < 0) {
            payout.transactions.delete(payment.transaction_code) // remove refunds
          }
          payout.count = payout.transactions.size
        }
        continue
      }

      n = payout.total_before_discount
      n += ratio * summary.total_before_discount
      payout.total_before_discount = +n.toFixed(2)

      n = payout.discount
      n += ratio * summary.discount
      payout.discount = +n.toFixed(2)

      n = payout.total
      n += payment.amount
      payout.total = +n.toFixed(2)

      n = payout.vat
      n += ratio * summary.vat
      payout.vat = +n.toFixed(2)

      n = payout.net
      n += ratio * summary.net
      payout.net = +n.toFixed(2)

      n = payout.fees
      n += payment.fees
      payout.fees = +n.toFixed(2)

      n = payout.refunds
      n += ratio * summary.refunds
      payout.refunds = +n.toFixed(2)

      if (method === 'SUMUP') {
        payout.transactions.add(payment.transaction_code) // unique transactions
        if (payment.amount < 0) {
          payout.transactions.delete(payment.transaction_code) // remove refunds
        }
        payout.count = payout.transactions.size
      }
    }
  }

  console.log(
    `daily summary counts`,
    dailySummary.SUMUP.count,
    dailySummary.SUMUP.transactions.size,
    dailySummary.CASH.count,
    dailySummary.CARD.count,
    dailySummary.VOUCHER.count,
  )
  return dailySummary
}

// const salesCategories = async (salesItems) => {
//   let salesByCategory = {
//     WET: [],
//     DRY: [],
//     TEA_COFFEE: [],
//     SNACKS: [],
//     FOOD: [],
//     ALCOHOL: [],
//     DRINK: [],
//     MISC: [],
//     DELETED: [],
//   }

//   for (const sale of salesItems) {
//     const { id, product_name, product_id, order_status } = sale
//     if (order_status !== 'COMPLETED') continue

//     try {
//       if (!product_id) {
//         // MISC sale
//         salesByCategory['MISC'].push(sale)
//         continue
//       }

//       const parentCategory = await parentCategoryFromProductId(product_id)
//       if (parentCategory) {
//         const category = parentCategory.name
//         salesByCategory[category].push(sale)

//         // define WET | DRY categories
//         if (category === 'DRINK' || category === 'ALCOHOL') {
//           salesByCategory['WET'].push(sale)
//         }

//         if (category === 'FOOD') {
//           const foodCategory = await categoryFromProductId(product_id)
//           if (foodCategory.name === 'SNACKS') {
//             salesByCategory['SNACKS'].push(sale)
//             // exclude SNACKS from DRY sales
//             continue
//           }

//           if (foodCategory.name === 'TEA & COFFEE') {
//             salesByCategory['TEA_COFFEE'].push(sale)
//             // exclude TEA & COFFEE from DRY sales
//             continue
//           }

//           salesByCategory['DRY'].push(sale)
//         }
//         continue
//       }
//       sale.deleted_product = true
//       salesByCategory['DELETED'].push(sale)
//     } catch (err) {
//       error('failed to find', { product_name, product_id, id }, err.message)
//       sale.deleted_product = true
//       salesByCategory['DELETED'].push(sale)
//     }
//   }

//   return salesByCategory
// }

// const salesByRegister = async (sales) => {
//   const registers = {}

//   for (const sale of sales) {
//     const register = sale.register.register_name

//     sale.register = register

//     registers[register] ??= { sales: [], items: [] }

//     const current = registers[register]
//     current.sales.push(sale)
//     current.items = current.items.concat(sale.sales_details.sales_items)
//   }

//   for (const register in registers) {
//     const current = registers[register]
//     const { items } = current
//     current.categories = await salesCategories(items)
//   }

//   return registers
// }

// const sortClosuresByTimeTo = (closures) => {
//   closures.data = closures.data.sort((a, b) => {
//     const aTimeTo = date(a.time_to)
//     const bTimeTo = date(b.time_to)

//     return sortAscending(aTimeTo, bTimeTo)
//   })
// }

// // populate closure.sales from the list of all sales
// const salesByClosure = (sales, closure) => {
//   const register = closure.register_name
//   const from = date(closure.time_from)
//   const to = date(closure.time_to)
//   closure.sales = []
//   closure.items = []

//   for (const sale of sales) {
//     const saleRegister = sale.register.register_name

//     // ignore sales for other registers
//     if (saleRegister !== register) continue

//     // ignore sales outside of the from-to time range for this closure
//     const time = date(sale.sales_date_time)
//     if (time.isBefore(from, 'second')) continue
//     if (time.isAfter(to, 'second')) continue

//     // okay we have a sale in this register's closure
//     closure.sales.push(sale)
//     closure.items = closure.items.concat(sale.sales_details.sales_items)
//   }
// }

// // get all the register closures between the 2 dates (from, to)
// export const registers = async (
//   from = date().subtract(1, 'day').startOf('day'),
//   to = from.add(1, 'day'),
// ) => {
//   try {
//     const format = 'DD/MM/YYYY hh:mm A'
//     const daterange = `${from.format(format)} - ${to.format(format)}`

//     const params = new URLSearchParams({ daterange })
//     // const url = `https://api.thegoodtill.com/api/register_closures`
//     const url = `https://api.thegoodtill.com/api/register_closures?${params}`
//     // log({ url, params })
//     const response = await fetch(url, {
//       method: 'GET',
//       headers: { ...authorization(), 'content-type': 'application/json' },
//     })

//     if (response.ok) {
//       const json = await response.json()
//       sortClosuresByTimeTo(json)
//       return json
//     }

//     throw Error(`registers failed [${response.statusText}]`)
//   } catch (e) {
//     error(`registers failed [${e.message}]`)
//     throw e
//   }
// }

// // return the earliest closure.time_from and latest closure.time_to to get the
// // date range of all sales

// const closuresDateRange = (closures) => {
//   let from = date()
//   let to = date(0)

//   for (const closure of closures) {
//     const fromTime = date(closure.time_from)
//     const toTime = date(closure.time_to)
//     from = date(Math.min(+from, +fromTime))
//     to = date(Math.max(+to, +toTime))
//   }

//   return { from, to }
// }

// // create a summary posting for sage from the categories
// const sagePostings = (closure) => {
//   let cash = closure.payments.find((payment) => payment.method === 'cash')
//   cash = cash ? cash.counted : 0
//   let vouchers = closure.payments.find(
//     (payment) => payment.method === 'voucher',
//   )
//   vouchers = vouchers ? vouchers.counted : 0

//   let barWetCash = 0
//   let barWetCC = 0
//   let barDry = 0
//   if (closure.register === 'Members Bar') {
//     barWetCash = cash
//     barWetCC = +(closure['WET'].netSales - cash).toFixed(2)
//     barDry = closure['DRY'].netSales
//   }

//   let venueWetCash = 0
//   let venueWetCC = 0
//   let venueDry = 0
//   if (closure.register !== 'Members Bar') {
//     venueWetCash = cash
//     venueWetCC = +(closure['WET'].netSales - cash).toFixed(2)
//     venueDry = closure['DRY'].netSales
//   }

//   let teaCoffee = closure['TEA_COFFEE'].netSales
//   let vending = closure['SNACKS'].netSales
//   let misc = closure['MISC'].netSales

//   Object.assign(closure, {
//     barWetCash,
//     barWetCC,
//     barDry,
//     venueWetCash,
//     venueWetCC,
//     venueDry,
//     teaCoffee,
//     vending,
//     vouchers,
//     misc,
//   })
// }

// // create a summary for each of the sales item categories
// const summarizeCategories = (categories) => {
//   const summaries = {}
//   for (const category in categories) {
//     let quantity = 0
//     let grossSales = 0
//     let totalSales = 0
//     let memberDiscounts = 0
//     let saleDiscounts = 0
//     let vat = 0
//     let list = []

//     for (const sale of categories[category]) {
//       const detail = {
//         name: sale.product_name,
//         id: sale.product_id,
//         sale: sale.id,
//         quantity: +sale.quantity,
//         price: +sale.price_inc_vat_per_item,
//         gross: +sale.quantity * +sale.price_inc_vat_per_item,
//         total: +sale.line_total_after_discount,
//         memberDiscounts:
//           +sale.quantity * +sale.price_inc_vat_per_item -
//           +sale.line_total_after_line_discount,
//         saleDiscounts:
//           +sale.line_total_after_line_discount -
//           +sale.line_total_after_discount,
//         vat: +sale.line_vat_after_discount,
//       }

//       quantity += detail.quantity
//       grossSales += detail.quantity * detail.price
//       totalSales += detail.total
//       memberDiscounts += detail.quantity * detail.price - detail.total
//       saleDiscounts += detail.saleDiscounts
//       vat += detail.vat
//       if (sale.deleted_product) list.push(detail)
//     }

//     summaries[category] = {
//       quantity: quantity,
//       grossSales: +grossSales.toFixed(2),
//       memberDiscounts: +memberDiscounts.toFixed(2),
//       saleDiscounts: +saleDiscounts.toFixed(2),
//       totalSales: +totalSales.toFixed(2),
//       vat: +vat.toFixed(2),
//       netSales: +(+totalSales.toFixed(2) - +vat.toFixed(2)).toFixed(2),
//       list,
//     }
//   }

//   return summaries
// }

// // registerClosures()
// // note: must call login() before this.
// // range can be
// // today, yesterday, week, month, year, financial-year,
// // DD/MM/YYYY (single date) or DD/MM/YYYY-DD/MM/YYYY (date range)

// export const registerClosures = async (range) => {
//   const { from, to } = dateRange(range)
//   const closures = await registers(from, to)
//   const n = closures.data.length
//   if (!n) {
//     info(`no register closures ${range ? range : 'yesterday'}`)
//     return
//   }

//   // we have some closures to process
//   {
//     const { from, to } = closuresDateRange(closures.data)
//     console.log(
//       `gathering sales between ${from.format(ukDateTimeFormat)} and ${to.format(
//         ukDateTimeFormat,
//       )}`,
//     )
//     const allSales = await sales(from, to)
//     writeFileSync('sales.json', JSON.stringify(allSales, null, 2))

//     info(closures.data.length, 'closures')
//     info(allSales.length, 'sales')

//     const formattedClosures = []
//     for (const closure of closures.data) {
//       salesByClosure(allSales, closure)
//       closure.categories = await salesCategories(closure.items)
//       closure.summaries = summarizeCategories(closure.categories)

//       const newClosure = {
//         id: closure.id,
//         register: closure.register_name,
//         staff: closure.staff_name,
//         from: date(closure.time_from).toISOString(),
//         to: date(closure.time_to).toISOString(),
//         payments: closure.payments.map((payment) => {
//           payment.expected = +payment.expected
//           payment.counted = +payment.counted
//           payment.variance = +(payment.expected - payment.counted).toFixed(2)
//           return payment
//         }),
//         sales: closure.sales.length,
//         total: +closure.payments
//           .reduce((total, payment) => {
//             const newTotal = total + +payment.counted
//             return newTotal
//           }, 0)
//           .toFixed(2),
//         ...closure.summaries,
//       }

//       // summarise the postings to be made to sage
//       sagePostings(newClosure)

//       formattedClosures.push(newClosure)
//     }
//     // info('%o', formattedClosures)

//     return formattedClosures
//   }
// }
