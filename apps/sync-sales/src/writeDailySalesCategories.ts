import { dayjs } from '@wwsc/lib-dates'
import { dailySalesCategories } from '@wwsc/lib-sumup-pos'

import type {
  DailySalesCategory,
  SaleSummary,
  SummarySalesItem,
} from '@wwsc/lib-sumup-pos'
import { writeFileSync } from 'node:fs'
import { insertSalesCategory, type InsertSalesCategory } from '@wwsc/lib-db'
import { nanoid } from 'nanoid'
import { Big } from 'big.js'

export const writeDailySalesCategories = async (
  sales: SaleSummary[],
  items: SummarySalesItem[],
  directory: string,
) => {
  const categories = dailySalesCategories(sales, items)
  if (categories.length === 0) return []

  const date = dayjs(categories[0].date).format('YYYY-MM-DD')
  for (const category of categories) {
    const sc: InsertSalesCategory = {
      id: `salesCategory_${nanoid()}`,
      day: category.day,
      date,
      scope: category.scope,
      name: category.name,
      quantity: category.quantity,
      gross: category.gross,
      discount: category.discount,
      total: category.total,
      vat: category.vat,
      net: category.net,
      cash: category.cash,
      sumup: category.sumup,
      card: category.card,
      voucher: category.voucher,
      fees: category.fees,
    }

    // await insertSalesCategory(sc)
  }

  let file = `${directory}/sales-categories.json`
  writeFileSync(file, JSON.stringify(categories, null, 2))

  checkDailyCategories(categories)

  return categories
}

function checkDailyCategories(categories: DailySalesCategory[]) {
  const all = categories.find((s) => s.scope === 'ALL')
  if (!all) return

  const registers = categories.filter((s) => s.scope === 'REGISTER')
  const staff = categories.filter((s) => s.scope === 'STAFF')
  const products = categories.filter((s) => s.scope === 'PRODUCT')
  const parent_categories = categories.filter(
    (s) => s.scope === 'PARENT_CATEGORY',
  )
  const ccategories = categories.filter((s) => s.scope === 'CATEGORY')
  const cashs = categories.filter((s) => s.scope === 'CASH')
  const sumups = categories.filter((s) => s.scope === 'SUMUP')
  const cards = categories.filter((s) => s.scope === 'CARD')
  const vouchers = categories.filter((s) => s.scope === 'VOUCHER')

  const barWetCash = categories.filter((s) => s.scope === 'BAR_WET_CASH')
  const barWetCard = categories.filter((s) => s.scope === 'BAR_WET_CARD')
  const barWetSumup = categories.filter((s) => s.scope === 'BAR_WET_SUMUP')
  const barWetVoucher = categories.filter((s) => s.scope === 'BAR_WET_VOUCHER')
  const barDryCash = categories.filter((s) => s.scope === 'BAR_DRY_CASH')
  const barDryCard = categories.filter((s) => s.scope === 'BAR_DRY_CARD')
  const barDrySumup = categories.filter((s) => s.scope === 'BAR_DRY_SUMUP')
  const barDryVoucher = categories.filter((s) => s.scope === 'BAR_DRY_VOUCHER')
  const venueWetCash = categories.filter((s) => s.scope === 'VENUE_WET_CASH')
  const venueWetCard = categories.filter((s) => s.scope === 'VENUE_WET_CARD')
  const venueWetSumup = categories.filter((s) => s.scope === 'VENUE_WET_SUMUP')
  const venueWetVoucher = categories.filter(
    (s) => s.scope === 'VENUE_WET_VOUCHER',
  )
  const venueDryCash = categories.filter((s) => s.scope === 'VENUE_DRY_CASH')
  const venueDryCard = categories.filter((s) => s.scope === 'VENUE_DRY_CARD')
  const venueDrySumup = categories.filter((s) => s.scope === 'VENUE_DRY_SUMUP')
  const venueDryVoucher = categories.filter(
    (s) => s.scope === 'VENUE_DRY_VOUCHER',
  )
  const teaCoffeeCash = categories.filter((s) => s.scope === 'TEA_COFFEE_CASH')
  const teaCoffeeCard = categories.filter((s) => s.scope === 'TEA_COFFEE_CARD')
  const teaCoffeeSumup = categories.filter(
    (s) => s.scope === 'TEA_COFFEE_SUMUP',
  )
  const teaCoffeeVoucher = categories.filter(
    (s) => s.scope === 'TEA_COFFEE_VOUCHER',
  )
  const snacksCash = categories.filter((s) => s.scope === 'SNACKS_CASH')
  const snacksCard = categories.filter((s) => s.scope === 'SNACKS_CARD')
  const snacksSumup = categories.filter((s) => s.scope === 'SNACKS_SUMUP')
  const snacksVoucher = categories.filter((s) => s.scope === 'SNACKS_VOUCHER')

  const miscCash = categories.filter((s) => s.scope === 'MISC_CASH')
  const miscCard = categories.filter((s) => s.scope === 'MISC_CARD')
  const miscSumup = categories.filter((s) => s.scope === 'MISC_SUMUP')
  const miscVoucher = categories.filter((s) => s.scope === 'MISC_VOUCHER')

  const bankCharges = categories.filter((s) => s.scope === 'BANK_CHARGES')
  const misc = categories.filter(
    (s) => s.scope === 'PARENT_CATEGORY' && s.name === 'MISC',
  )
  const sageCategories = [
    ...barWetCash,
    ...barWetCard,
    ...barWetSumup,
    ...barWetVoucher,
    ...barDryCash,
    ...barDryCard,
    ...barDrySumup,
    ...barDryVoucher,
    ...venueWetCash,
    ...venueWetCard,
    ...venueWetSumup,
    ...venueWetVoucher,
    ...venueDryCash,
    ...venueDryCard,
    ...venueDrySumup,
    ...venueDryVoucher,
    ...teaCoffeeCash,
    ...teaCoffeeCard,
    ...teaCoffeeSumup,
    ...teaCoffeeVoucher,
    ...snacksCash,
    ...snacksCard,
    ...snacksSumup,
    ...snacksVoucher,
    ...miscCash,
    ...miscCard,
    ...miscSumup,
    ...miscVoucher,
    ...bankCharges,
  ]

  const sageSumupCategories = [
    ...barWetSumup,
    ...barDrySumup,
    ...venueWetSumup,
    ...venueDrySumup,
    ...teaCoffeeSumup,
    ...snacksSumup,
    ...miscSumup,
  ]

  const sageCashCategories = [
    ...barWetCash,
    ...barDryCash,
    ...venueWetCash,
    ...venueDryCash,
    ...teaCoffeeCash,
    ...snacksCash,
    ...miscCash,
  ]

  const sageVoucherCategories = [
    ...barWetVoucher,
    ...barDryVoucher,
    ...venueWetVoucher,
    ...venueDryVoucher,
    ...teaCoffeeVoucher,
    ...snacksVoucher,
    ...miscVoucher,
  ]
  checkAllTotalsMatch(all, registers, 'REGISTER')
  checkAllTotalsMatch(all, staff, 'STAFF')
  checkAllTotalsMatch(all, products, 'PRODUCT')
  checkAllTotalsMatch(all, parent_categories, 'PARENT_CATEGORY')
  checkAllTotalsMatch(all, ccategories, 'CATEGORY')
  checkAllTotalsMatch(
    all,
    [...cashs, ...sumups, ...cards, ...vouchers],
    'PAYMENT',
  )

  checkAllTotalsMatch(cashs[0], sageCashCategories, 'CASH')
  checkAllTotalsMatch(sumups[0], sageSumupCategories, 'SUMUP')
  checkAllTotalsMatch(vouchers[0], sageVoucherCategories, 'VOUCHER')
  checkAllTotalsMatch(all, sageCategories, 'SAGE')
}

function checkAllTotalsMatch(
  all: DailySalesCategory,
  scope: DailySalesCategory[],
  type: string,
) {
  if (scope.length === 0) return

  const template: DailySalesCategory = structuredClone(all)
  template.scope = scope[0].scope
  template.quantity =
    template.gross =
    template.discount =
    template.total =
    template.vat =
    template.net =
    template.cash =
    template.sumup =
    template.card =
    template.voucher =
      0

  for (const s of scope) {
    template.gross = Big(template.gross).plus(s.gross).round(2).toNumber()
    template.discount = Big(template.discount)
      .plus(s.discount)
      .round(2)
      .toNumber()
    template.total = Big(template.total).plus(s.total).round(2).toNumber()
    template.vat = Big(template.vat).plus(s.vat).round(2).toNumber()
    template.net = Big(template.net).plus(s.net).round(2).toNumber()
    template.cash = Big(template.cash).plus(s.cash).round(2).toNumber()
    template.sumup = Big(template.sumup).plus(s.sumup).round(2).toNumber()
    template.card = Big(template.card).plus(s.card).round(2).toNumber()
    template.voucher = Big(template.voucher).plus(s.voucher).round(2).toNumber()
  }

  if (template.gross !== all.gross) {
    console.error('Gross mismatch', type, template.gross, all.gross)
  }

  if (template.discount !== all.discount) {
    console.error('Discount mismatch', type, template.discount, all.discount)
  }

  if (template.total !== all.total) {
    console.error('Total mismatch', type, template.total, all.total)
  }

  if (template.vat !== all.vat) {
    console.error('VAT mismatch', type, template.vat, all.vat)
  }

  if (template.net !== all.net) {
    console.error('Net mismatch', type, template.net, all.net)
  }

  if (template.cash !== all.cash) {
    console.error('Cash mismatch', type, template.cash, all.cash)
  }

  if (template.sumup !== all.sumup) {
    console.error('Sumup mismatch', type, template.sumup, all.sumup)
  }

  if (template.card !== all.card) {
    console.error('Card mismatch', type, template.card, all.card)
  }

  if (template.voucher !== all.voucher) {
    console.error('Voucher mismatch', type, template.voucher, all.voucher)
  }

  // console.log('Totals match', type, all.scope)
  // console.log('Totals match')
}
