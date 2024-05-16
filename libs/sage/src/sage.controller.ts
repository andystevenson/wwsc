import { getSessionUser, saveSessionUser } from './auth'
import { GET } from './GET'
import { POST } from './POST'
import { DELETE } from './DELETE'
import type {
  Params,
  Reference,
  PaymentMethodList,
  PaymentMethod,
  BankAccount,
  BankAccountList,
  LedgerAccountList,
  LedgerAccount,
  LedgerEntryList,
  LedgerEntry,
  TaxRateList,
  TaxRate,
  OtherPayment,
  OtherPaymentLine,
  OtherPaymentResponse,
  OtherPaymentRequest,
} from './Types'
import { dayjs } from '@wwsc/dates'

export const getBankAccount = async (code: string) => {
  if (!code) return null

  const getBankAccountsData = GET<BankAccountList>('bank_accounts', code)
  let bankAccounts = await getBankAccountsData()
  const name = 'Bank Current Account (HSSBC 41828193) (1200)'
  let list = bankAccounts.$items.filter(
    (account) => account.displayed_as === name,
  )
  return list
}

export const getLedgers = async (code: string) => {
  if (!code) return null

  const getLedgersData = GET<LedgerAccountList>('ledger_accounts', code, {
    visible_in: 'other_receipts',
    items_per_page: '200',
  })
  let ledgers = await getLedgersData()
  const wanted = [
    'Bar Dry (4005)',
    'Bar Wet (4007)',
    'Venue Wet (4008)',
    'Venue Dry (4009)',
    'Vending sales (4010)',
    'Tea & Coffee (4011)',
    'Member voucher payments (8207)',
    'Bank Charges (7901)',
  ]
  let list = ledgers['$items'].filter((ledger) => {
    return wanted.includes(ledger.displayed_as)
  })
  return list
}

export const findLedger = (id: string, ledgers: LedgerAccount[]) => {
  let ledger = null

  switch (id) {
    case 'bar-dry':
      ledger = ledgers.find(
        (ledger) => ledger.displayed_as === 'Bar Dry (4005)',
      )
      break
    case 'bar-wet':
      ledger = ledgers.find(
        (ledger) => ledger.displayed_as === 'Bar Wet (4007)',
      )
      break
    case 'venue-wet':
      ledger = ledgers.find(
        (ledger) => ledger.displayed_as === 'Venue Wet (4008)',
      )
      break
    case 'venue-dry':
      ledger = ledgers.find(
        (ledger) => ledger.displayed_as === 'Venue Dry (4009)',
      )
      break
    case 'vending-sales':
      ledger = ledgers.find(
        (ledger) => ledger.displayed_as === 'Vending sales (4010)',
      )
      break
    case 'tea-coffee':
      ledger = ledgers.find(
        (ledger) => ledger.displayed_as === 'Tea & Coffee (4011)',
      )
      break
    case 'vouchers':
      ledger = ledgers.find(
        (ledger) => ledger.displayed_as === 'Member voucher payments (8207)',
      )
      break
    case 'bank-charges':
      ledger = ledgers.find(
        (ledger) => ledger.displayed_as === 'Bank Charges (7901)',
      )
      break
    default:
      return null
  }

  return ledger
}

export const getEntries = async (code: string, id: string) => {
  if (!code) return null

  const ledgers = await getLedgers(code)
  let ledger = ledgers ? findLedger(id, ledgers) : null

  if (!ledger) return null

  console.log('getEntries', id, code, ledger)

  const from_date = dayjs('2023-12-05')
  const to_date = dayjs('2023-12-05')
  const ledger_account_id = ledger.id
  const items_per_page = 200
  const attributes = 'all'
  const getEntriesData = GET<LedgerEntryList>('ledger_entries', code, {
    from_date: from_date.format('YYYY-MM-DD'),
    to_date: to_date.format('YYYY-MM-DD'),
    ledger_account_id,
    items_per_page: items_per_page.toString(),
  })

  const entries = await getEntriesData()
  const data = []

  const nested_attributes = 'all'
  for (const entry of entries['$items']) {
    const getEntryData = GET(entry['$path'], code, {
      nested_attributes,
      attributes,
    })
    const entryData = await getEntryData()
    data.push(entryData)
  }
  return JSON.stringify(data, null, 2)
}

export const getUser = async (code: string) => {
  // if we already have a user then return that

  let user = await getSessionUser(code)
  if (user) return user

  const getUserData = GET('user', code)
  user = await getUserData()
  await saveSessionUser(code, user)
  return user
}

export const getPaymentMethods = async (code: string) => {
  const getPaymentMethodsData = GET<PaymentMethodList>('payment_methods', code)
  const payment = await getPaymentMethodsData()
  return payment.$items
}

export const getTaxRates = async (code: string) => {
  const getTaxRatesData = GET<TaxRateList>('tax_rates', code)
  const taxRates = await getTaxRatesData()
  return taxRates.$items
}

const findPaymentMethod = (id: string, methods: PaymentMethod[]) => {
  let method = null
  switch (id.toLowerCase()) {
    case 'cash':
      method = methods.find((m) => m.id === 'CASH')
      break

    case 'credit-debit':
      method = methods.find((m) => m.id === 'CREDIT_DEBIT')
      break

    case 'check':
      method = methods.find((m) => m.id === 'CHECK')
      break

    case 'electronic':
      method = methods.find((m) => m.id === 'ELECTRONIC')
      break

    case 'online-payment':
      method = methods.find((m) => m.id === 'ONLINE_PAYMENT')
      break

    default:
      break
  }
  return method
}

type Request = {
  id: string
  date: string
  title: string
  user: string
  venue: string
  cash: number
  cc: number
  dry: number
  vending: number
  tea: number
  vouchers: number
  misc: number
}

export const postUpdate = async (code: string, request: Request) => {
  // the request is net sales values
  // add the vat back (rounded)
  const id = request.id
  const date = request.date
  const title = request.title
  const user = request.user
  const cash = +(+request.cash).toFixed(2)
  const cc = +(+request.cc * 1.2).toFixed(2)
  const dry = +(+request.dry * 1.2).toFixed(2)
  const vending = +(+request.vending * 1.2).toFixed(2)
  const tea = +(+request.tea * 1.2).toFixed(2)
  const vouchers = +(+request.vouchers).toFixed(2)
  const misc = +(+request.misc).toFixed(2)

  const total =
    misc > 0
      ? +(cc + dry + vending + tea + misc).toFixed(2)
      : +(cc + dry + vending + tea).toFixed(2)

  const ledgers = await getLedgers(code)
  if (!ledgers) return

  const wetLedger = findLedger(`${request.venue}-wet`, ledgers)
  if (!wetLedger) return

  const dryLedger = findLedger(`${request.venue}-dry`, ledgers)
  if (!dryLedger) return

  const vendingLedger = findLedger('vending-sales', ledgers)
  if (!vendingLedger) return

  const teaLedger = findLedger('tea-coffee', ledgers)
  if (!teaLedger) return

  const vouchersLedger = findLedger('vouchers', ledgers)
  if (!vouchersLedger) return

  const bankAccount = await getBankAccount(code)
  if (!bankAccount) return

  const paymentMethods = await getPaymentMethods(code)
  if (!paymentMethods) return

  const cashPaymentMethod = findPaymentMethod('cash', paymentMethods)
  if (!cashPaymentMethod) return

  const cashReceipt = {
    transaction_type_id: 'OTHER_RECEIPT',
    bank_account_id: bankAccount[0].id,
    payment_method_id: cashPaymentMethod.id,
    date: date,
    total_amount: cash,
    reference: title.split(',')[0],
    payment_lines: [
      {
        ledger_account_id: wetLedger.id,
        total_amount: cash,
        tax_rate_id: 'GB_STANDARD',
        details: 'wet Cash',
      },
    ],
  }

  const creditDebitPaymentMethod = findPaymentMethod(
    'credit-debit',
    paymentMethods,
  )
  if (!creditDebitPaymentMethod) return

  const receipt: OtherPayment = {
    transaction_type_id: 'OTHER_RECEIPT',
    bank_account_id: bankAccount[0].id,
    payment_method_id: creditDebitPaymentMethod.id,
    date: date,
    total_amount: total,
    reference: title.split(',')[0],
    payment_lines: [],
  }

  const refund = {
    transaction_type_id: 'OTHER_PAYMENT',
    bank_account_id: bankAccount[0].id,
    payment_method_id: creditDebitPaymentMethod.id,
    date: date,
    total_amount: Math.abs(misc),
    reference: title.split(',')[0],
    payment_lines: [
      {
        ledger_account_id: dryLedger.id,
        total_amount: Math.abs(misc),
        tax_rate_id: 'GB_NO_TAX',
        details: 'misc Refund',
      },
    ],
  }

  const voucherPayment = {
    transaction_type_id: 'OTHER_PAYMENT',
    bank_account_id: bankAccount[0].id,
    payment_method_id: creditDebitPaymentMethod.id,
    date: date,
    total_amount: vouchers,
    reference: title.split(',')[0],
    payment_lines: [
      {
        ledger_account_id: vouchersLedger.id,
        total_amount: vouchers,
        tax_rate_id: 'GB_NO_TAX',
        details: 'member vouchers',
      },
    ],
  }

  if (cc > 0 || cc < 0) {
    receipt.payment_lines.push({
      ledger_account_id: wetLedger.id,
      total_amount: cc,
      tax_rate_id: 'GB_STANDARD',
      details: 'wet C/C',
    })
  }

  if (dry > 0 || dry < 0) {
    receipt.payment_lines.push({
      ledger_account_id: dryLedger.id,
      total_amount: dry,
      tax_rate_id: 'GB_STANDARD',
      details: 'dry C/C',
    })
  }

  // only post +ve misc to DRY
  // -ve misc represents a refund which we need to post as a payment
  if (misc > 0) {
    receipt.payment_lines.push({
      ledger_account_id: dryLedger.id,
      total_amount: misc,
      tax_rate_id: 'GB_NO_TAX',
      details: 'misc food C/C',
    })
  }

  if (vending > 0 || vending < 0) {
    receipt.payment_lines.push({
      ledger_account_id: vendingLedger.id,
      total_amount: vending,
      tax_rate_id: 'GB_STANDARD',
      details: 'vending C/C',
    })
  }

  if (tea > 0 || tea < 0) {
    receipt.payment_lines.push({
      ledger_account_id: teaLedger.id,
      total_amount: tea,
      tax_rate_id: 'GB_STANDARD',
      details: 'tea & coffee C/C',
    })
  }

  const postCash = POST<OtherPaymentResponse, OtherPaymentRequest>(
    'other_payments',
    code,
    {
      other_payment: cashReceipt,
    },
  )

  const postCC = POST<OtherPaymentResponse, OtherPaymentRequest>(
    'other_payments',
    code,
    {
      other_payment: receipt,
    },
  )

  const postRefund = POST<OtherPaymentResponse, OtherPaymentRequest>(
    'other_payments',
    code,
    {
      other_payment: refund,
    },
  )

  const postVouchers = POST<OtherPaymentResponse, OtherPaymentRequest>(
    'other_payments',
    code,
    {
      other_payment: voucherPayment,
    },
  )

  let cashOtherReceipt = null
  if (cash > 0 || cash < 0) {
    cashOtherReceipt = await postCash()
  }

  let ccOtherReceipt = null
  if (total > 0) {
    ccOtherReceipt = await postCC()
  }

  let refundOtherPayment = null
  if (misc < 0) {
    refundOtherPayment = await postRefund()
  }

  let vouchersOtherPayment = null
  if (vouchers > 0) {
    vouchersOtherPayment = await postVouchers()
  }
  // const cashOtherReceipt = { id: 'cash-xxxx' }
  // const ccOtherReceipt = { id: 'cc-xxxx' }

  const today = dayjs()
  const updateRequest = {
    id,
    status: 'posted',
    datePostedToSage: today.format(),
    postedToSageBy: user,
    sageIdCash: cashOtherReceipt ? cashOtherReceipt.id : '',
    sageIdCC: ccOtherReceipt ? ccOtherReceipt.id : '',
    sageIdRefund: refundOtherPayment ? refundOtherPayment.id : '',
    sageIdVouchers: vouchersOtherPayment ? vouchersOtherPayment.id : '',
  }

  let update = null
  if (
    updateRequest.sageIdCash ||
    updateRequest.sageIdCC ||
    updateRequest.sageIdRefund ||
    updateRequest.sageIdVouchers
  ) {
    // update = DB.update(updateRequest)
  }

  console.log('postUpdate', {
    cashReceipt,
    receipt,
    cashOtherReceipt,
    ccOtherReceipt,
    refundOtherPayment,
    vouchersOtherPayment,
    updateRequest,
    update,
  })
}

export const reverseUpdate = async (
  code: string,
  request: { id: string; user: string },
) => {
  // read the closure from the database
  const { id, user } = request
  const closure = DB.read(id)

  if (closure) {
    const { sageIdCash, sageIdCC, sageIdRefund, sageIdVouchers } = closure

    if (sageIdCash) {
      const deleteCashOtherReceipt = DELETE('other_payments', code, {
        id: sageIdCash,
      })
      const cashDeleted = await deleteCashOtherReceipt()
    }

    if (sageIdCC) {
      const deleteCCOtherReceipt = DELETE('other_payments', code, {
        id: sageIdCC,
      })

      const ccDeleted = await deleteCCOtherReceipt()
    }

    if (sageIdRefund) {
      const deleteRefundOtherPayment = DELETE('other_payments', code, {
        id: sageIdRefund,
      })

      const refundDeleted = await deleteRefundOtherPayment()
    }

    if (sageIdVouchers) {
      const deleteVouchersOtherPayment = DELETE('other_payments', code, {
        id: sageIdVouchers,
      })

      const refundDeleted = await deleteVouchersOtherPayment()
    }

    const today = dayjs()
    const updateRequest = {
      id,
      status: 'not-posted',
      datePostedToSage: today.format(),
      postedToSageBy: user,
      sageIdCash: '',
      sageIdCC: '',
      sageIdRefund: '',
      sageIdVouchers: '',
    }

    const update = DB.update(updateRequest)

    console.log('reverseUpdate', {
      code,
      request,
      id,
      sageIdCC,
      sageIdCash,
      updateRequest,
      update,
    })
  }
}
