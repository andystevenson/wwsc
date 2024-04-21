export type TransactionHistory = {
  items: Item[]
  links: Link[]
}

export type Item = {
  amount: number
  card_type: CardType
  currency: Currency
  entry_mode: EntryMode
  id: string
  installments_count: number
  internal_bin?: string
  internal_card_scheme?: InternalCardScheme
  internal_card_type?: InternalCardType
  internal_client_transaction_id: string
  internal_entry_mode_id: number
  internal_id: number
  internal_payment_type: number
  internal_status?: InternalStatus
  internal_tx_result: string
  payment_type: PaymentType
  payout_date?: Date
  payout_plan: PayoutPlan
  payout_type?: PayoutType
  payouts_received?: number
  payouts_total?: number
  product_summary: string
  refunded_amount?: number
  status: Status
  timestamp: Date
  transaction_code: string
  transaction_id: string
  type: Type
  user: string
}

export type Currency = 'GBP'

export type CardType =
  | 'MASTER'
  | 'VISA'
  | 'AMEX'
  | 'CUP'
  | 'DINERS'
  | 'DISCOVER'
  | 'ELO'
  | 'ELV'
  | 'HIPERCARD'
  | 'JCB'
  | 'MAESTRO'
  | 'MASTERCARD'
  | 'VISA_ELECTRON'
  | 'VISA_VPAY'
  | 'UNKNOWN'

export type EntryMode =
  | 'chip'
  | 'none'
  | 'contactless'
  | 'customer entry'
  | 'na'

export type InternalCardScheme =
  | 'MASTER'
  | 'VISA'
  | 'AMEX'
  | 'CUP'
  | 'DINERS'
  | 'DISCOVER'
  | 'ELO'
  | 'ELV'
  | 'HIPERCARD'
  | 'JCB'
  | 'MAESTRO'
  | 'MASTERCARD'
  | 'VISA_ELECTRON'
  | 'VISA_VPAY'
  | 'UNKNOWN'

export type InternalCardType = 'MC' | 'VISA' | 'AMEX'

export type InternalStatus =
  | 'CAPTURED'
  | 'SYSTEM_ERROR'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'REVERSED'
  | 'DECLINED_INTERNAL'
  | 'DECLINED_ACQUIRER'

export type PaymentType = 'POS' | 'ECOM' | 'RECURRING' | 'BOLETO'

export type PayoutPlan =
  | 'SINGLE_PAYMENT'
  | 'TRUE_INSTALLMENT'
  | 'ACCELERATED_INSTALLMENT'

export type PayoutType = 'BANK_ACCOUNT'

export type Status =
  | 'SUCCESSFUL'
  | 'FAILED'
  | 'REFUNDED'
  | 'PENDING'
  | 'CANCELLED'

export type Type = 'PAYMENT' | 'REFUND'

export type Summary = {
  id: string
  transaction_code: string
  status: Status
  timestamp: Date
  type: Type
  amount: number
  refunded_amount?: number
}

export type Transaction = {
  amount: number
  card_reader: CardReader
  client_transaction_id: string
  currency: Currency
  device_info: DeviceInfo
  entry_mode: EntryMode
  foreign_transaction_id: string
  horizontal_accuracy: number
  id: string
  installments_count: number
  internal_id: number
  lat: number
  links: Link[]
  local_time: Date
  location: Location
  lon: number
  merchant_code: string
  merchant_id: number
  payment_type: PaymentType
  payout_plan: PayoutPlan
  payout_type: PayoutType
  payouts_received: number
  payouts_total: number
  product_summary: string
  products: Product[]
  simple_payment_type: string
  simple_status: SimpleStatus
  status: SimpleStatus
  tax_enabled: boolean
  timestamp: Date
  tip_amount: number
  transaction_code: string
  transaction_events: TransactionEvent[]
  username: string
  vat_amount: number
  vat_rates: any[]
  verification_method: VerificationMethod
  auth_code?: string
  card?: Card
  events?: Event[]
  fee_amount?: number
  payout_date?: Date
  summary?: Summary
}

export type Card = {
  expiry_month: number
  expiry_year: number
  last_4_digits: string
  pan_seq: number
  token: string
  type: CardType
  cardholder_name?: string
}

export type CardReader = {
  code: string
  type: EntryMode
}

export type DeviceInfo = {
  model: string
  name: string
  system_name: string
  system_version: string
  uuid: string
}

export type Event = {
  amount: number
  deducted_amount?: number
  deducted_fee_amount?: number
  fee_amount: number
  id: number
  installment_number?: number
  payout_id?: number
  payout_reference?: string
  payout_type?: PayoutType
  status: EventStatus
  timestamp: Date
  transaction_id: string
  type: EventType
}

export type EventStatus = 'PAID_OUT' | 'REFUNDED' | 'CANCELLED'

export type EventType = 'PAYOUT' | 'REFUND'

export type Link = {
  href: string
  rel: Rel
  type?: LinkType
  disclaimer?: 'settled_deduction'
  max_amount?: number
  min_amount?: number
}

export type Rel = 'receipt' | 'refund' | 'next'

export type LinkType = 'image/svg+xml' | 'image/png' | 'application/json'

export type Location = {
  horizontal_accuracy: number
  lat: number
  lon: number
}

export type Product = {
  name: string
  price: number
  quantity: number
  total_price: number
}

export type SimpleStatus = 'FAILED' | 'PAID_OUT' | 'SUCCESSFUL'

export type TransactionEvent = {
  amount: number
  date: Date
  due_date?: Date
  event_type: EventType
  id: number
  installment_number?: number
  status: EventStatus
  timestamp: Date
}

export type VerificationMethod = 'none' | 'na' | 'offline PIN'

export type SimplifiedTransaction = {
  id: string
  transaction_code: string
  status: Status
  timestamp: Date
  type: Type
  amount: number
  refunded_amount?: number
  simple_status: SimpleStatus
  t_status: SimpleStatus
  t_timestamp: Date
  client_transaction_id: string
  fee_amount: number
  t_card?: CardType
}
