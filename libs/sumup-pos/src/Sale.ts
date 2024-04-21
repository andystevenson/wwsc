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

export type RegisterName = 'Members Bar' | 'Westview Bar' | 'Warwick Bar'

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
  register: string
  staff: string
  product: string
  category: string
  parent_category: string
  quantity: number
  unit_price: number
  item_notes: string
  created_at: Date
  updated_at: Date
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
