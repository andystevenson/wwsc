import type { DayOfWeek } from '@wwsc/lib-dates'

export { DayOfWeek }

export type Sale = {
  id: string
  outlet_id: string
  register_id: string
  staff_id: string
  customer_id: CustomerId
  order_no: number
  sale_type: SaleType
  table_code: TableCode
  table_no: TableNo
  order_status: OrderStatus
  receipt_no: string
  order_notes: Notes
  discount_id: DiscountId
  sales_date_time: Date
  eatin_takeaway: string
  sales_details: SalesDetails
  sales_payments: SalesPayments
  sales_payments_history: SalesPaymentsHistory[]
  sales_payments_card_history: SalesPaymentsCardHistory[]
  meta: any[]
  outlet: Outlet
  register: Register
  customer: any[]
  staff: Staff
  total_cover: number
}

export type CustomerId = null | string
export type SaleType = 'INSTORE' | string
export type OrderStatus = 'COMPLETED' | string
export type SyncStatus = 'UPLOADED' | string
export type TableCode = null | string
export type TableNo = null | string
export type Notes = null | string
export type DiscountId = null | string
export type ProductId = null | string
export type SplitBy = null | string
export type Modifiers = null | string

export type Outlet = {
  id: string
  outlet_name: string
}

export type Register = {
  id: string
  register_name: RegisterName
}

export type RegisterName =
  | 'Members Bar'
  | 'Westview Bar'
  | 'Warwick Bar'
  | 'Reception'
  | string

export type SalesDetails = {
  quantity: string
  physical_quantity: number
  total_before_line_discount: string
  subtotal_before_line_discount: string
  vat_before_line_discount: number
  total_after_line_discount: string
  subtotal_after_line_discount: string
  vat_after_line_discount: number
  promo_offers: number
  line_discount: number | string
  total_after_discount: string
  subtotal_after_discount: string
  vat_after_discount: number
  sales_items: SalesItem[]
  delivery_charge: string
  service_charge: string
  total_ex_vat: string
  total_vat: string
  total: string
  total_vat_recalc: string
  metadata: string
  split_by: SplitBy
  split_for: number
}

export type SalesItem = {
  id: string
  client_id: string
  outlet_id: string
  sales_id: string
  register_id: string
  user_id: string
  staff_id: string
  product_id: ProductId
  has_discount: number
  discount_is_percentage: number
  discount_amount: string
  order_status: OrderStatus
  product_name: string
  quantity: number
  quantity_loose: string
  price_inc_vat_per_item: string
  vat_rate_id: string
  vat_rate: string
  split_no: number
  sequence_no: number
  item_notes: string
  sync_status: SyncStatus
  last_sync_date: number
  is_removed: number
  flagged: number
  created_at: Date
  updated_at: Date
  discount_id: DiscountId
  modifiers: Modifiers
  bundle_products: BundleProducts
  item_meta: null
  line_total_after_line_discount: string
  line_subtotal_after_line_discount: string
  line_vat_after_line_discount: number
  line_total_after_discount: number | string
  line_subtotal_after_discount: number | string
  line_vat_after_discount: number | string
  item_type: ItemType
  tags: any[]
  modifiers_array: ModifiersArray[] | null
  eatin_takeaway: string
  course: string
  product_cover: number
}

export type SummarySalesItem = {
  id: string
  sales_id: string
  register: RegisterName
  staff: string
  product: string
  category: string
  parent_category: string
  quantity: number
  unit_price: number
  item_notes: string
  created_at: Date
  updated_at: Date
  gross: number
  discount: number
  total: number
  vat: number
  net: number
  cash: number
  sumup: number
  card: number
  voucher: number
}

export type BundleProducts = '' | '{}'

export type ItemType = 'PRODUCT' | 'MISC'

export type ModifiersArray = {
  id: string
  modifier_name: string
  price: string
  quantity: number
  tags: string
}

export type SalesPayments = {
  CASH?: Card
  SUMUP?: Card
  VOUCHER?: Card
  CARD?: Card
}

export type Card = {
  payment_amount: string
  payment_change: string
  payment_total: string
}

export type SalesPaymentsCardHistory = {
  id: string
  client_id: string
  outlet_id: string
  sales_id: string
  sales_payment_id: string
  aid: string
  tsi: string
  tvr: string
  authorization_code: string
  card_brand: CardBrand
  card_payment_uuid: string
  entry_mode: EntryMode
  obfuscated_pan: string
  pan_hash: null
  pan_last_digits: string
  reference_number: string
  type: null
  order_status: OrderStatus
  sync_status: SyncStatus
  last_sync_date: number
  created_at: Date
  updated_at: Date
}

export type CardBrand =
  | 'VISA'
  | 'MASTERCARD'
  | 'AMEX'
  | 'VOUCHER'
  | 'MAESTRO'
  | 'DINERS'
  | 'DISCOVER'
  | 'JCB'
  | 'UNIONPAY'
  | null

export type EntryMode = 'contactless' | 'chip' | string

export type SalesPaymentsHistory = {
  id: string
  payment_method: PaymentMethod
  payment_date_time: Date
  payment_amount: string
  payment_amount_actual: string
  payment_change_actual: string
}

export type PaymentMethod = 'CASH' | 'SUMUP' | 'VOUCHER' | 'CARD'

export type Staff = {
  id: string
  staff_name: StaffName
}

export type StaffName = string

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

export type DailySummary = {
  date: Date
  SUMUP: PayoutSummary
  CASH: PayoutSummary
  CARD: PayoutSummary
  VOUCHER: PayoutSummary
}

export type PaymentHistory = {
  id: string
  sales_id: string
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
  payments_mismatch: number
  payments: Array<PaymentHistory>
}

export const SageCategories = [
  'BAR_WET_CASH',
  'BAR_WET_CARD',
  'BAR_WET_SUMUP',
  'BAR_WET_VOUCHER',
  'BAR_DRY_CASH',
  'BAR_DRY_CARD',
  'BAR_DRY_SUMUP',
  'BAR_DRY_VOUCHER',
  'VENUE_WET_CASH',
  'VENUE_WET_CARD',
  'VENUE_WET_SUMUP',
  'VENUE_WET_VOUCHER',
  'VENUE_DRY_CASH',
  'VENUE_DRY_CARD',
  'VENUE_DRY_SUMUP',
  'VENUE_DRY_VOUCHER',
  'TEA_COFFEE_CASH',
  'TEA_COFFEE_CARD',
  'TEA_COFFEE_SUMUP',
  'TEA_COFFEE_VOUCHER',
  'SNACKS_CASH',
  'SNACKS_CARD',
  'SNACKS_SUMUP',
  'SNACKS_VOUCHER',
  'MISC_CASH',
  'MISC_CARD',
  'MISC_SUMUP',
  'MISC_VOUCHER',
  'BANK_CHARGES',
] as const

type SageScope = (typeof SageCategories)[number]

export const Scopes = [
  'ALL',
  'REGISTER',
  'STAFF',
  'PRODUCT',
  'CATEGORY',
  'PARENT_CATEGORY',
  'SUMUP',
  'CASH',
  'CARD',
  'VOUCHER',
  ...SageCategories,
] as const

export type Scope = (typeof Scopes)[number]

type Predicate = (s: SummarySalesItem) => boolean

export type ScopePredicate = Record<Scope, Predicate>
export type SageScopePredicate = Record<SageScope, Predicate>

// Sage Category Predicates

const isWet = (item: SummarySalesItem) =>
  item.parent_category === 'ALCOHOL' || item.parent_category === 'DRINK'

const isDry = (item: SummarySalesItem) =>
  item.parent_category === 'FOOD' &&
  !(item.category === 'TEA & COFFEE' || item.category === 'SNACKS')

const isBarWet = (item: SummarySalesItem) =>
  isWet(item) && item.register === 'Members Bar'
const isBarDry = (item: SummarySalesItem) =>
  isDry(item) && item.register === 'Members Bar'

const isVenueWet = (item: SummarySalesItem) =>
  isWet(item) && item.register !== 'Members Bar'
const isVenueDry = (item: SummarySalesItem) =>
  isDry(item) && item.register !== 'Members Bar'

const isBarWetCash = (item: SummarySalesItem) =>
  isBarWet(item) && item.cash !== 0
const isBarWetCard = (item: SummarySalesItem) =>
  isBarWet(item) && item.card !== 0
const isBarWetSumup = (item: SummarySalesItem) =>
  isBarWet(item) && item.sumup !== 0
const isBarWetVoucher = (item: SummarySalesItem) =>
  isBarWet(item) && item.voucher !== 0

const isBarDryCash = (item: SummarySalesItem) =>
  isBarDry(item) && item.cash !== 0
const isBarDryCard = (item: SummarySalesItem) =>
  isBarDry(item) && item.card !== 0
const isBarDrySumup = (item: SummarySalesItem) =>
  isBarDry(item) && item.sumup !== 0
const isBarDryVoucher = (item: SummarySalesItem) =>
  isBarDry(item) && item.voucher !== 0

const isVenueWetCash = (item: SummarySalesItem) =>
  isVenueWet(item) && item.cash !== 0
const isVenueWetCard = (item: SummarySalesItem) =>
  isVenueWet(item) && item.card !== 0
const isVenueWetSumup = (item: SummarySalesItem) =>
  isVenueWet(item) && item.sumup !== 0
const isVenueWetVoucher = (item: SummarySalesItem) =>
  isVenueWet(item) && item.voucher !== 0

const isVenueDryCash = (item: SummarySalesItem) =>
  isVenueDry(item) && item.cash !== 0
const isVenueDryCard = (item: SummarySalesItem) =>
  isVenueDry(item) && item.card !== 0
const isVenueDrySumup = (item: SummarySalesItem) =>
  isVenueDry(item) && item.sumup !== 0
const isVenueDryVoucher = (item: SummarySalesItem) =>
  isVenueDry(item) && item.voucher !== 0

const isTeaCoffeeCard = (item: SummarySalesItem) =>
  item.card !== 0 && item.category === 'TEA & COFFEE'
const isTeaCoffeeCash = (item: SummarySalesItem) =>
  item.cash !== 0 && item.category === 'TEA & COFFEE'
const isTeaCoffeeSumup = (item: SummarySalesItem) =>
  item.sumup !== 0 && item.category === 'TEA & COFFEE'
const isTeaCoffeeVoucher = (item: SummarySalesItem) =>
  item.voucher !== 0 && item.category === 'TEA & COFFEE'

const isSnacksCard = (item: SummarySalesItem) =>
  item.card !== 0 && item.category === 'SNACKS'
const isSnacksCash = (item: SummarySalesItem) =>
  item.cash !== 0 && item.category === 'SNACKS'
const isSnacksSumup = (item: SummarySalesItem) =>
  item.sumup !== 0 && item.category === 'SNACKS'
const isSnacksVoucher = (item: SummarySalesItem) =>
  item.voucher !== 0 && item.category === 'SNACKS'

const isMisc = (item: SummarySalesItem) => item.category === 'MISC'
const isMiscCard = (item: SummarySalesItem) => item.card !== 0 && isMisc(item)
const isMiscCash = (item: SummarySalesItem) => item.cash !== 0 && isMisc(item)
const isMiscSumup = (item: SummarySalesItem) => item.sumup !== 0 && isMisc(item)
const isMiscVoucher = (item: SummarySalesItem) =>
  item.voucher !== 0 && isMisc(item)

const isBankCharges = (item: SummarySalesItem) => true

export const SageScopePredicates: SageScopePredicate = {
  BAR_WET_CASH: isBarWetCash,
  BAR_WET_CARD: isBarWetCard,
  BAR_WET_SUMUP: isBarWetSumup,
  BAR_WET_VOUCHER: isBarWetVoucher,
  BAR_DRY_CASH: isBarDryCash,
  BAR_DRY_CARD: isBarDryCard,
  BAR_DRY_SUMUP: isBarDrySumup,
  BAR_DRY_VOUCHER: isBarDryVoucher,
  VENUE_WET_CASH: isVenueWetCash,
  VENUE_WET_CARD: isVenueWetCard,
  VENUE_WET_SUMUP: isVenueWetSumup,
  VENUE_WET_VOUCHER: isVenueWetVoucher,
  VENUE_DRY_CASH: isVenueDryCash,
  VENUE_DRY_CARD: isVenueDryCard,
  VENUE_DRY_SUMUP: isVenueDrySumup,
  VENUE_DRY_VOUCHER: isVenueDryVoucher,
  TEA_COFFEE_CASH: isTeaCoffeeCash,
  TEA_COFFEE_CARD: isTeaCoffeeCard,
  TEA_COFFEE_SUMUP: isTeaCoffeeSumup,
  TEA_COFFEE_VOUCHER: isTeaCoffeeVoucher,
  SNACKS_CASH: isSnacksCash,
  SNACKS_CARD: isSnacksCard,
  SNACKS_SUMUP: isSnacksSumup,
  SNACKS_VOUCHER: isSnacksVoucher,
  MISC_CASH: isMiscCash,
  MISC_CARD: isMiscCard,
  MISC_SUMUP: isMiscSumup,
  MISC_VOUCHER: isMiscVoucher,
  BANK_CHARGES: isBankCharges,
}

export type DailySalesCategory = {
  id: string
  day: DayOfWeek
  date: Date
  scope: Scope
  name: string
  quantity: number
  gross: number
  discount: number
  total: number
  vat: number
  net: number
  cash: number
  sumup: number
  card: number
  voucher: number
  fees: number
}

export const SageLedgers = [
  'Bar Wet',
  'Bar Dry',
  'Venue Wet',
  'Venue Dry',
  'TEA_COFFEE',
  'VOUCHERS',
  'BANK_CHARGES',
] as const

export type SageLedger =
  | 'bar-wet'
  | 'bar-dry'
  | 'venue-wet'
  | 'venue-dry'
  | 'tea-coffee'
  | 'vouchers'
  | 'bank-charges'

export type DailySagePosting = {
  id: string
  date: Date
  register: RegisterName
  staff: StaffName
  ledger: SageLedger
  total: number
  vat: number
  net: number
  cash: number
  sumup: number
  card: number
  voucher: number
  transaction: string | null
}
