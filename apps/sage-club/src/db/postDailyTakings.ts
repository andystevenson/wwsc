/**
 * This function is used to post daily takings to Sage & record the transactions to the database
 *
 * */

import {
  getUser,
  getBankAccounts,
  getLedgerAccounts,
  ledgerIds,
  otherPayment,
  wwcHSBC,
  LedgerIds,
  type OtherPayment,
  type User,
} from '@wwsc/lib-sage'

import { SelectSalesCategory, insertSageTransaction } from '@wwsc/lib-db'

import { Big } from 'big.js'

import { getSageCategories } from './getDailyTakings'

import kebabCase from 'lodash.kebabcase'

type TransactionDefaults = {
  user: User
  account: string
  ledgers: LedgerIds
}

export const getTransactionDefaults = async (bearer: string) => {
  const user = await getUser(bearer)
  const bankAccounts = await getBankAccounts(bearer)
  const hsbc = wwcHSBC(bankAccounts)
  if (!hsbc) {
    throw new Error('WWC HSBC bank account not found!')
  }
  const ledgerAccounts = await getLedgerAccounts(bearer)
  const ledgers = ledgerIds(ledgerAccounts)

  let account = hsbc.id
  return {
    user,
    account,
    ledgers,
  }
}

export const postDailyTakings = async (bearer: string, date: string) => {
  const defaults = await getTransactionDefaults(bearer)
  const categories = await getSageCategories(date)
  let bankCharges = await postBankCharges(bearer, defaults, categories)
  let cash = await postCashTakings(bearer, defaults, categories)
  let sumup = await postSumupTakings(bearer, defaults, categories)
  let card = await postCardTakings(bearer, defaults, categories)
  let vouchers = await postVoucherTakings(bearer, defaults, categories)
  let refunds = await postRefunds(bearer, defaults, categories)
  return { bankCharges, cash, sumup, card, vouchers, refunds }
}

export const postBankCharges = async (
  bearer: string,
  defaults: TransactionDefaults,
  categories: SelectSalesCategory[],
) => {
  const bankCharges = categories.find((c) => c.name === 'BANK_CHARGES')
  if (!bankCharges) return null

  const { account, ledgers } = defaults
  const { date, fees } = bankCharges
  const payment: OtherPayment = {
    transaction_type_id: 'OTHER_PAYMENT',
    payment_method_id: 'ELECTRONIC',
    bank_account_id: account,
    date,
    total_amount: fees,
    reference: `sumup fees ${date}`,
    payment_lines: [
      {
        ledger_account_id: ledgers.bankCharges,
        total_amount: fees,
        tax_rate_id: 'GB_EXEMPT',
        details: 'sumup fees',
      },
    ],
  }

  let response = await otherPayment(bearer, payment)
  const transaction = await insertSageTransaction({
    user: `${defaults.user.first_name} ${defaults.user.last_name}`,
    transactionId: response.id,
    date: response.date,
    ledger: 'bank-charges',
    content: JSON.stringify(response),
  })
  return { response, transaction }
}

type Filter = (categories: SelectSalesCategory[]) => SelectSalesCategory[]

export const postTakings = async (
  bearer: string,
  defaults: TransactionDefaults,
  categories: SelectSalesCategory[],
  filter: Filter,
  tax_rate_id: string,
  payment_method_id: string,
  type: string,
) => {
  let targetCategories = filter(categories).filter((c) => c.total > 0)
  if (targetCategories.length === 0) return null

  const { account, ledgers } = defaults
  const date = targetCategories[0].date

  const total = targetCategories.reduce(
    (acc, c) => Big(acc).plus(c.total).round(2).toNumber(),
    0,
  )

  const lines = targetCategories.map((c) => ({
    ledger_account_id: categoryNameToLedger(c.name, ledgers),
    total_amount: c.total,
    tax_amount: c.vat,
    net_amount: c.net,
    tax_rate_id,
    details: kebabCase(c.name),
  }))

  const payment: OtherPayment = {
    transaction_type_id: 'OTHER_RECEIPT',
    payment_method_id,
    bank_account_id: account,
    date,
    total_amount: total,
    reference: `${type} takings ${date}`,
    payment_lines: lines,
  }

  let response = await otherPayment(bearer, payment)
  const transaction = await insertSageTransaction({
    user: `${defaults.user.first_name} ${defaults.user.last_name}`,
    transactionId: response.id,
    date: response.date,
    ledger: '*',
    content: JSON.stringify(response),
  })

  return { response, transaction }
}

export const postCashTakings = async (
  bearer: string,
  defaults: TransactionDefaults,
  categories: SelectSalesCategory[],
) => {
  return postTakings(
    bearer,
    defaults,
    categories,
    cashTakings,
    'GB_STANDARD',
    'CASH',
    'cash',
  )
}

export const postSumupTakings = async (
  bearer: string,
  defaults: TransactionDefaults,
  categories: SelectSalesCategory[],
) => {
  return postTakings(
    bearer,
    defaults,
    categories,
    sumupTakings,
    'GB_STANDARD',
    'CREDIT_DEBIT',
    'sumup',
  )
}

export const postCardTakings = async (
  bearer: string,
  defaults: TransactionDefaults,
  categories: SelectSalesCategory[],
) => {
  return postTakings(
    bearer,
    defaults,
    categories,
    cardTakings,
    'GB_STANDARD',
    'CREDIT_DEBIT',
    'card',
  )
}

export const postVoucherTakings = async (
  bearer: string,
  defaults: TransactionDefaults,
  categories: SelectSalesCategory[],
) => {
  let targetCategories = voucherTakings(categories).filter((c) => c.total > 0)
  if (targetCategories.length === 0) return null

  const { account, ledgers } = defaults
  const date = targetCategories[0].date

  const total = targetCategories.reduce(
    (acc, c) => Big(acc).plus(c.total).round(2).toNumber(),
    0,
  )

  const lines = targetCategories.map((c) => ({
    ledger_account_id: categoryNameToLedger(c.name, ledgers),
    total_amount: c.total,
    tax_rate_id: 'GB_NO_TAX',
    details: kebabCase(c.name),
  }))

  const payment: OtherPayment = {
    transaction_type_id: 'OTHER_PAYMENT',
    payment_method_id: 'CREDIT_DEBIT',
    bank_account_id: account,
    date,
    total_amount: total,
    reference: `vouchers ${date}`,
    payment_lines: lines,
  }

  let response = await otherPayment(bearer, payment)
  const transaction = await insertSageTransaction({
    user: `${defaults.user.first_name} ${defaults.user.last_name}`,
    transactionId: response.id,
    date: response.date,
    ledger: '*',
    content: JSON.stringify(response),
  })

  return { response, transaction }
}

// TODO: what about cash refunds?

export const postRefunds = async (
  bearer: string,
  defaults: TransactionDefaults,
  categories: SelectSalesCategory[],
) => {
  let targetCategories = categories.filter((c) => c.total < 0)
  if (targetCategories.length === 0) return null

  const { account, ledgers } = defaults
  const date = targetCategories[0].date

  const sum = targetCategories.reduce(
    (acc, c) => Big(acc).plus(c.total).toNumber(),
    0,
  )

  let total = Big(sum).abs().toNumber()

  const lines = targetCategories.map((c) => ({
    ledger_account_id: categoryNameToLedger(c.name, ledgers),
    total_amount: Big(c.total).abs().toNumber(),
    tax_rate_id: 'GB_NO_TAX',
    details: kebabCase(c.name),
  }))

  const payment: OtherPayment = {
    transaction_type_id: 'OTHER_PAYMENT',
    payment_method_id: 'CREDIT_DEBIT',
    bank_account_id: account,
    date,
    total_amount: total,
    reference: `refunds ${date}`,
    payment_lines: lines,
  }

  let response = await otherPayment(bearer, payment)
  const transaction = await insertSageTransaction({
    user: `${defaults.user.first_name} ${defaults.user.last_name}`,
    transactionId: response.id,
    date: response.date,
    ledger: '*',
    content: JSON.stringify(response),
  })

  return { response, transaction }
}

const cashTakings = (categories: SelectSalesCategory[]) => {
  return categories.filter((c) => c.name.endsWith('_CASH'))
}

const sumupTakings = (categories: SelectSalesCategory[]) => {
  return categories.filter((c) => c.name.endsWith('_SUMUP'))
}

const cardTakings = (categories: SelectSalesCategory[]) => {
  return categories.filter((c) => c.name.endsWith('_CARD'))
}

const voucherTakings = (categories: SelectSalesCategory[]) => {
  return categories.filter((c) => c.name.endsWith('_VOUCHER'))
}

const categoryNameToLedger = (name: string, ledgers: LedgerIds) => {
  if (name.endsWith('VOUCHER')) return ledgers.vouchers
  if (name.startsWith('BAR_DRY')) return ledgers.barDry
  if (name.startsWith('BAR_WET')) return ledgers.barWet
  if (name.startsWith('VENUE_DRY')) return ledgers.venueDry
  if (name.startsWith('VENUE_WET')) return ledgers.venueWet
  if (name.startsWith('TEA')) return ledgers.teaCoffee
  if (name.startsWith('SNACKS')) return ledgers.vending
  if (name.startsWith('MISC')) return ledgers.barDry
  if (name.startsWith('DELETED')) return ledgers.barDry
  return ledgers.barDry
}
