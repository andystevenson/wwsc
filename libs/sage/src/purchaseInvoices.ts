import {
  type Params,
  type Link,
  type Transaction,
  type Base,
  type Contact,
  type TaxBreakdown,
  type AnalysisTypeLineItem,
  type TaxRate,
} from './Types'

import { GET } from './GET'

export type SalesPrice = {
  id?: string
  displayed_as?: string
  created_at?: string
  updated_at?: string
  price_name?: string
  price?: number
  price_includes_tax?: boolean
  product_sales_price_type?: Base
}

export type Product = {
  id?: string
  displayed_as?: string
  $path?: string
  created_at?: string
  updated_at?: string
  deleted_at?: string
  deletable?: boolean
  deactivatable?: boolean
  used_on_recurring_invoice?: boolean
  item_code?: string
  description?: string
  notes?: string
  sales_ledger_account?: Base
  sales_tax_rate?: Base
  purchase_ledger_account?: Base
  usual_supplier?: Contact
  purchase_tax_rate?: Base
  cost_price?: number
  sales_prices?: SalesPrice[]
  source_guid?: string
  purchase_description?: string
  active?: boolean
  catalog_item_type?: Base
}

export type Rate = {
  id?: string
  displayed_as?: string
  created_at?: string
  updated_at?: string
  rate_name?: string
  rate?: number
  rate_includes_tax?: boolean
  service_rate_type?: Base
}

export type Service = {
  id?: string
  displayed_as?: string
  $path?: string
  created_at?: string
  updated_at?: string
  deleted_at?: string
  deletable?: boolean
  deactivatable?: boolean
  used_on_recurring_invoice?: boolean
  item_code?: string
  description?: string
  notes?: string
  sales_ledger_account?: Base
  purchase_ledger_account?: Base
  sales_tax_rate?: Base
  purchase_tax_rate?: Base
  /** @description The sales rates for the service */
  sales_rates?: Rate[]
  /** @description Used when importing services from external sources */
  source_guid?: string
  /** @description The service purchase description */
  purchase_description?: string
  usual_supplier?: Contact
  /** @description Indicates whether the service is active */
  active?: boolean
  /**
   * Format: double
   * @description The cost price of the service
   */
  cost_price?: number
  /** @description Indicates whether the service is One Stop Shop */
  oss_service?: boolean
}

export type ArtefactTaxAnalysis = {
  tax_rate?: Base
  net_amount?: number
  tax_amount?: number
  total_amount?: number
  goods_amount?: number
  service_amount?: number
}

export type ArtefactDetailedTaxAnalysis = {
  tax_rates_breakdown?: ArtefactDetailedTaxAnalysisBreakdown
  total_net?: number
  total_tax?: number
  total?: number
  total_goods_amount?: number
  total_services_amount?: number
  base_currency_total_net?: number
  base_currency_total_tax?: number
  base_currency_total?: number
  base_currency_total_goods_amount?: number
  base_currency_total_services_amount?: number
  total_retailer_tax?: number
}

export type ArtefactDetailedTaxAnalysisBreakdown = {
  tax_rate?: TaxRate
  name?: string
  percentage?: number
  net_amount?: number
  tax_amount?: number
  retail_tax_amount?: number
  total_amount?: number
  goods_amount?: number
  services_amount?: number
  base_currency_net_amount?: number
  base_currency_tax_amount?: number
  base_currency_total_amount?: number
  base_currency_goods_amount?: number
  base_currency_services_amount?: number
}

export type PurchaseInvoiceLineItem = {
  id?: string
  displayed_as?: string
  is_purchase_for_resale?: boolean
  analysis_type_categories?: AnalysisTypeLineItem[]
  description?: string
  product?: Product
  service?: Service
  ledger_account?: Base
  trade_of_asset?: boolean
  quantity?: number
  unit_price?: number
  net_amount?: number
  tax_rate?: Base
  tax_amount?: number
  tax_breakdown?: TaxBreakdown[]
  total_amount?: number
  base_currency_unit_price?: number
  unit_price_includes_tax?: boolean
  base_currency_net_amount?: number
  base_currency_tax_amount?: number
  base_currency_tax_breakdown?: TaxBreakdown[]
  base_currency_total_amount?: number
  eu_goods_services_type?: Base
  gst_amount?: number
  pst_amount?: number
  tax_recoverable?: boolean
}

export type PurchaseCorrectiveInvoice = {
  id?: string
  displayed_as?: string
  $path?: string
  created_at?: string
  updated_at?: string
  links?: Link[]
  /** @description Indicates whether artefact can be edited */
  editable?: boolean
  /** @description Indicates whether Domestic Reverser Charge is applied to the artefact. Only used for a UK business. */
  vat_reverse_charge?: boolean
  transaction?: Transaction
  transaction_type?: Base
  contact?: Contact
  deleted_at?: string
  contact_name?: string
  contact_reference?: string
  date?: string
  due_date?: string
  reference?: string
  vendor_reference?: string
  notes?: string
  total_quantity?: number
  net_amount?: number
  tax_amount?: number
  total_amount?: number
  payments_allocations_total_amount?: number
  payments_allocations_total_discount?: number
  total_paid?: number
  outstanding_amount?: number
  currency?: Base
  exchange_rate?: number
  inverse_exchange_rate?: string
  base_currency_net_amount?: number
  base_currency_tax_amount?: number
  base_currency_total_amount?: number
  base_currency_outstanding_amount?: number
  status?: Base
  void_reason?: string
  invoice_lines?: PurchaseInvoiceLineItem[]
  tax_analysis?: ArtefactTaxAnalysis[]
  detailed_tax_analysis?: ArtefactDetailedTaxAnalysis
  payments_allocations?: PaymentAllocation[]
  last_paid?: string
  withholding_tax_rate?: number
  withholding_tax_amount?: number
  base_currency_withholding_tax_amount?: number
  original_invoice?: Generic
  original_invoice_number?: string
  original_invoice_date?: string
  tax_reconciled?: boolean
  import?: boolean
}

export type PurchaseInvoice = {
  id?: string
  displayed_as?: string
  $path?: string
  created_at?: string
  updated_at?: string
  links?: Link[]
  editable?: boolean
  vat_reverse_charge?: boolean
  transaction?: Transaction
  transaction_type?: Base
  postponed_accounting?: boolean
  import?: boolean
  vat_exempt_consignment?: boolean

  deleted_at?: string
  is_cis?: boolean

  cis_applicable_amount?: number

  base_currency_cis_applicable_amount?: number

  total_after_cis_deduction?: number

  base_currency_total_after_cis_deduction?: number
  has_cis_labour?: boolean
  has_cis_materials?: boolean
  contact?: Contact
  base_currency_total_itc_amount?: number
  total_itc_amount?: number
  base_currency_total_itr_amount?: number
  total_itr_amount?: number
  part_recoverable?: boolean
  contact_name?: string
  contact_reference?: string
  date?: string
  due_date?: string
  reference?: string
  vendor_reference?: string
  notes?: string
  total_quantity?: number
  net_amount?: number
  tax_amount?: number
  total_amount?: number
  payments_allocations_total_amount?: number
  payments_allocations_total_discount?: number
  total_paid?: number
  outstanding_amount?: number
  currency?: Base
  exchange_rate?: number
  inverse_exchange_rate?: number
  base_currency_net_amount?: number
  base_currency_tax_amount?: number
  base_currency_total_amount?: number
  base_currency_outstanding_amount?: number
  status?: Base
  void_reason?: string
  invoice_lines?: PurchaseInvoiceLineItem[]
  tax_analysis?: ArtefactTaxAnalysis[]
  detailed_tax_analysis?: ArtefactDetailedTaxAnalysis
  payments_allocations?: PaymentAllocation[]
  last_paid?: string
  tax_address_region?: Base
  withholding_tax_rate?: number
  withholding_tax_amount?: number
  base_currency_withholding_tax_amount?: number
  corrections?: PurchaseCorrectiveInvoice[]
  tax_reconciled?: boolean
  migrated?: boolean
  tax_calculation_method?: string
}

type Generic = {
  id?: string
  displayed_as?: string
  $path?: string
  links?: Link[]
}

export type AllocatedArtefact = {
  id?: string
  artefact?: Generic
  amount?: number
}

export type ContactAllocation = {
  id?: string
  displayed_as?: string
  $path?: string
  created_at?: string
  updated_at?: string
  links?: Link[]
  transaction?: Base
  transaction_type?: Base
  deleted_at?: string
  date?: string
  contact?: Base
  allocated_artefacts?: AllocatedArtefact[]
}

export type AllocatedPaymentArtefact = {
  id?: string
  artefact?: Generic
  amount?: number
  discount?: number
}

export type PaymentOnAccount = {
  id?: string
  displayed_as?: string
  $path?: string
  created_at?: string
  updated_at?: string
  contact_name?: string
  contact_reference?: string
  contact?: Base
  date?: string
  reference?: string
  net_amount?: number
  tax_amount?: number
  total_amount?: number
  outstanding_amount?: number
  currency?: Base
  exchange_rate?: number
  base_currency_net_amount?: number
  base_currency_tax_amount?: number
  base_currency_total_amount?: number
  base_currency_outstanding_amount?: number
  status?: Base
}

type ContactPayment = {
  id?: string
  displayed_as?: string
  $path?: string
  created_at?: string
  updated_at?: string
  links?: Link[]
  transaction?: Base
  transaction_type?: Base
  deleted_at?: string
  payment_method?: Base
  contact?: Base
  bank_account?: Base
  date?: string
  net_amount?: number
  tax_amount?: number
  total_amount?: number
  currency?: Base
  exchange_rate?: number
  base_currency_net_amount?: number
  base_currency_tax_amount?: number
  base_currency_total_amount?: number
  base_currency_currency_charge?: number
  reference?: string
  allocated_artefacts?: AllocatedPaymentArtefact[]
  tax_rate?: Base
  payment_on_account?: PaymentOnAccount
  /** @description Indicates whether payment can be edited */
  editable?: boolean
}

export type PaymentAllocation = {
  links?: Link[]
  date?: string
  type?: string
  reference?: string
  amount?: number
  discount?: number
  stripe_transaction_id?: string
  contact_allocation?: ContactAllocation
  artefact?: Generic
  contact_payment?: ContactPayment
  /** @description Display text for the item */
  displayed_as?: string
  /** @description This is a negative payment */
  negative_payment?: boolean
}

type PurchaseInvoiceList = {
  $items: PurchaseInvoice[]
}

export const getPurchaseInvoices = async (code: string, params: Params) => {
  const getPurchaseInvoicesData = GET<PurchaseInvoiceList>(
    'purchase_invoices',
    code,
    params,
  )
  const payment = await getPurchaseInvoicesData()
  return payment.$items
}
