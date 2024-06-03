import type { Reference } from './Types'

import { POST } from './POST'
import { DELETE } from './DELETE'

export type OtherPaymentLine = {
  ledger_account_id: string
  total_amount: number
  tax_rate_id: string
  details: string
  net_amount?: number
  tax_amount?: number
}

export type OtherPayment = {
  transaction_type_id: 'OTHER_PAYMENT' | 'OTHER_RECEIPT'
  bank_account_id: string
  payment_method_id: string
  date: string
  total_amount: number
  reference: string
  net_amount?: number
  tax_amount?: number
  payment_lines: OtherPaymentLine[]
}

export type OtherPaymentRequest = {
  other_payment: OtherPayment
}

export type OtherPaymentResponse = Reference & {
  created_at: string
  updated_at: string
  transaction: Reference
  transaction_type: Reference
  deleted_at: string
  base_currency_total_itc_amount: number
  total_itc_amount: number
  base_currency_total_itr_amount: number
  total_itr_amount: number
  part_recoverable: boolean
  payment_method: Reference
  contact: Reference
  bank_account: Reference
  tax_address_region: Reference
  date: string
  net_amount: number
  tax_amount: number
  total_amount: number
  reference: string
  payment_lines: OtherPaymentLinesResponse[]
  editable?: boolean
  deletable?: boolean
  withholding_tax_rate?: number
  withholding_tax_amount?: number
}

export type OtherPaymentLinesResponse = {
  id: string
  displayed_as: string
  ledger_account: Reference
  details: string
  tax_rate: Reference
  net_amount: number
  tax_amount: number
  total_amount: number
  is_purchase_for_resale: boolean
  trade_of_asset: boolean
  gst_amount: number
  pst_amount: number
  tax_recoverable: boolean
}

export const otherPayment = async (bearer: string, payment: OtherPayment) => {
  const otherPaymentData = POST<OtherPaymentRequest, OtherPaymentResponse>(
    'other_payments',
    bearer,
    { other_payment: payment },
  )
  const otherPayment = await otherPaymentData()
  return otherPayment
}

export const deleteOtherPayment = async (bearer: string, id: string) => {
  const otherPaymentData = DELETE('other_payments', bearer, { id })
  return otherPayment
}
