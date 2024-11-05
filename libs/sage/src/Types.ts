export type Base = {
  id: string
  displayed_as: string
  $path: string
}

export type Params = { [key: string]: string }

export type Link = {
  href: string
  rel: string
  type: string
}

export type Reference = {
  id: string
  displayed_as: string
  $path: string
}

export type PaymentMethod = Reference

export type PaymentMethodList = {
  $items: PaymentMethod[]
}

export type BankAccountDetails = {
  account_name: string
  account_number: string
  sort_code: string
  bic: string
  iban: string
}

export type Address = Reference & {
  /** @description The first line of the address */
  address_line_1: string
  /** @description The second line of the address */
  address_line_2: string
  /** @description The address town/city */
  city: string
  /** @description The address postal code/zipcode */
  postal_code: string
  country: Reference
  /**
   * Format: date-time
   * @description The datetime when the item was deleted
   */
  deleted_at: string
  /**
   * Format: date-time
   * @description The datetime when the item was created
   */
  created_at: string
  /**
   * Format: date-time
   * @description The datetime when the item was last updated
   */
  updated_at: string
  bank_account: Reference
  contact: Reference
  address_type: Reference
  /** @description The custom name of the address */
  name: string
  /** @description The address state/province/region */
  region: string
  country_group: Reference
  /** @description Specifies the address as the contact's main address. Only a single address can exist for a contact in Start so this is always true when returned by the API but cannot be seen in the UI */
  is_main_address: boolean
}

export type BankAccountContact = {
  /** @description The name of the contact */
  name: string
  /** @description The job title of the contact */
  job_title: string
  /** @description The telephone of the contact */
  telephone: string
  /** @description The mobile of the contact */
  mobile: string
  /** @description The email of the contact */
  email: string
  /** @description The fax number of the contact */
  fax: string
}

export type JournalCode = Reference & {
  /**
   * Format: date-time
   * @description The datetime when the item was created
   */
  created_at: string
  /**
   * Format: date-time
   * @description The datetime when the item was last updated
   */
  updated_at: string
  /** @description The name of the journal code */
  name: string
  /** @description The code of the journal code */
  code: string
  journal_code_type: Reference
  /**
   * @description The control name of the journal code
   *
   * Control names are identifiers for a journal codes with a specific meaning. Some examples are `AC` for
   * purchases, `VE` for sales, `OD` for other transactions and `REPBAL` for opening balances.
   */
  control_name: string
  /**
   * @description Indicates whether the journal code is reserved.
   *
   * Reserved journal codes cannot be deleted. A journal code is reserved when it has a control name.
   * Please note that journal codes can also not be deleted when there is any journal that is using
   * the code.
   */
  reserved: boolean
}

export type BankAccount = Reference & {
  /**
   * Format: date-time
   * @description The datetime when the item was created
   */
  created_at: string
  /**
   * Format: date-time
   * @description The datetime when the item was last updated
   */
  updated_at: string
  /**
   * Format: date-time
   * @description The datetime when the item was deleted
   */
  deleted_at: string
  bank_account_details: BankAccountDetails
  ledger_account: Reference
  bank_account_type: Reference
  /**
   * Format: double
   * @description The bank account balance
   */
  balance: number
  main_address: Address
  main_contact_person: BankAccountContact
  /**
   * Format: int32
   * @description The nominal code of the bank account
   */
  nominal_code: number
  /** @description Indicates whether or not the bank account can be edited */
  editable: boolean
  /** @description Indicates whether or not the bank account can be deleted */
  deletable: boolean
  journal_code: JournalCode
  default_payment_method: Reference
  /**
   * Format: int32
   * @description The GIFI code of the bank ledger account'
   *
   * GIFI is short for The General Index of Financial Information and it lets the CRA validate tax information electronically instead of manually.
   * Information from financial statements is categorized under the appropriate 4-digit-long GIFI code and entered on corporate income tax returns.
   * GIFI is needed when filing a T2 income tax return.
   *
   * _Canada only_
   */
  gifi_code: number
  /** @description Indicates whether the Bank account is active or inactive. */
  is_active: boolean
  currency: Reference
}

export type BankAccountList = {
  $items: BankAccount[]
}

export type CoaGroupType = {
  /** @description The unique identifier for the item */
  id: string
  /** @description The name of the resource */
  displayed_as: string
}

export type LedgerAccountBalanceDetails = {
  /**
   * Format: double
   * @description The account balance
   */
  balance: number
  /** @description Is the balance a debit or credit */
  credit_or_debit: string
  /**
   * Format: double
   * @description The credit balance
   */
  credits: number
  /**
   * Format: double
   * @description The debit balance
   */
  debits: number
  /** @description The from date filter */
  from_date: string
  /** @description The to date filter */
  to_date: string
}

export type LedgerAccount = Reference & {
  /**
   * Format: date-time
   * @description The datetime when the item was created
   */
  created_at: string
  /**
   * Format: date-time
   * @description The datetime when the item was last updated
   */
  updated_at: string
  ledger_account_group: CoaGroupType
  /**
   * @description The name for the ledger account.
   *
   * Changes to this field do not propagate to other resources, namely not to the name of the associated
   * bank_account (unlike the behaviour of the UI).
   */
  name: string
  /** @description The display name for the ledger account */
  display_name: string
  /**
   * @description The visible scopes for the ledger account.
   *
   * This indicates in which of the UI's areas the ledger account is displayed and available for user
   * selection. Possible entries in this array are `bank`, `sales`, `purchasing`, `other_payment`,
   * `other_receipt`, `reporting`, `journals`, `sales_eu`, `sales_row`, `purchasing_eu`, `purchasing_row`
   * and `purchasing_hrc`.
   */
  visible_scope: string[]
  /** @description Indicates whether the ledger account is included in the chart of accounts */
  included_in_chart: boolean
  /**
   * Format: int32
   * @description The nominal code of the ledger account
   */
  nominal_code: number
  ledger_account_type: Reference
  ledger_account_classification: Reference
  tax_rate: Reference
  /** @description Indicates whether the default tax rate is fixed or may be changed per transaction */
  fixed_tax_rate: boolean
  /** @description Indicates whether the ledger account is displayed in the banking area of the application */
  visible_in_banking: boolean
  /** @description Indicates whether the ledger account is displayed in the purchases area of the application */
  visible_in_expenses: boolean
  /** @description Indicates whether the ledger account is displayed in the journals area of the application */
  visible_in_journals: boolean
  /** @description Indicates whether the ledger account is displayed in the other payments area of the application */
  visible_in_other_payments: boolean
  /** @description Indicates whether the ledger account is displayed in the other receipts area of the application */
  visible_in_other_receipts: boolean
  /** @description Indicates whether the ledger account is displayed in the reporting area of the application */
  visible_in_reporting: boolean
  /** @description Indicates whether the ledger account is displayed in the sales area of the application */
  visible_in_sales: boolean
  balance_details: LedgerAccountBalanceDetails
  /**
   * @description Indicates whether the ledger account is a control account.
   *
   * Control accounts cannot be removed. See also `control_name`.
   */
  is_control_account: boolean
  /**
   * @description The control name for the ledger account.
   *
   * This is used internally by Accounting to identify the correct ledger account for booking taxes etc.
   * You cannot add ledger accounts with control name and you cannot modify the control name of existing
   * ledger accounts.
   */
  control_name: string
  /** @description The display name formatted based on coa_list_order in settings */
  display_formatted: string
  /** @description Indicates that transactions posted to this ledger account have part recoverable taxes (Canada only) */
  tax_recoverable: boolean
  /**
   * Format: double
   * @description The partial recoverable tax rate (Canada only)
   */
  recoverable_percentage: number
  non_recoverable_ledger_account: LedgerAccount
  /** @description Indicates whether the ledger account is flagged for CIS Materials */
  cis_materials: boolean
  /** @description Indicates whether the ledger account is flagged for Tax Intalment (Canada only) */
  tax_instalment: boolean
  /** @description Indicates whether the ledger account is flagged for CIS Labour */
  cis_labour: boolean
  /**
   * Format: int32
   * @description The GIFI code of the ledger account.
   *
   * GIFI is short for The General Index of Financial Information and it lets the CRA validate tax information electronically instead of manually.
   * Information from financial statements is categorized under the appropriate 4-digit-long GIFI code and entered on corporate income tax returns.
   * GIFI is needed when filing a T2 income tax return.
   *
   * _Canada only_
   */
  gifi_code: number
}

export type LedgerAccountList = {
  $items: LedgerAccount[]
}

export type TaxRatePercentage = {
  /**
   * Format: double
   * @description The percentage of the rate
   */
  percentage: number
  /**
   * Format: date
   * @description The start date for the rate
   */
  from_date: string
  /**
   * Format: date
   * @description The end date for the rate
   */
  to_date: string
}

export type ComponentTaxRate = Reference & {
  /**
   * Format: date-time
   * @description The datetime when the item was created
   */
  created_at: string
  /**
   * Format: date-time
   * @description The datetime when the item was last updated
   */
  updated_at: string
  /** @description The name of the tax rate */
  name: string
  /** @description The agency name (US Only) */
  agency: string
  /**
   * Format: double
   * @description The current tax rate percentage
   */
  percentage: number
  /** @description The tax rate percentage and date ranges they apply to */
  percentages: TaxRatePercentage[]
  /** @description Indicates whether the tax rate is displayed in the application */
  is_visible: boolean
  /** @description Indicates if tax rate is a retailer rate or not */
  retailer: boolean
  /** @description Indicates whether a tax rate can be edited */
  editable: boolean
  /** @description Indicates whether a tax rate can be deleted */
  deletable: boolean
  /** @description Indicates whether the tax rate is made up of component tax rates */
  is_combined_rate: boolean
}

export type TaxRate = Reference & {
  /**
   * Format: date-time
   * @description The datetime when the item was created
   */
  created_at: string
  /**
   * Format: date-time
   * @description The datetime when the item was last updated
   */
  updated_at: string
  /** @description The name of the tax rate */
  name: string
  /** @description The agency name (US Only) */
  agency: string
  /**
   * Format: double
   * @description The current tax rate percentage
   */
  percentage: number
  /** @description The tax rate percentage and date ranges they apply to */
  percentages: TaxRatePercentage[]
  /** @description Indicates whether the tax rate is displayed in the application */
  is_visible: boolean
  /** @description Indicates if tax rate is a retailer rate or not */
  retailer: boolean
  /** @description Indicates whether a tax rate can be edited */
  editable: boolean
  /** @description Indicates whether a tax rate can be deleted */
  deletable: boolean
  /** @description Indicates whether the tax rate is made up of component tax rates */
  is_combined_rate: boolean
  /** @description The component tax rates which make up a combined rate */
  component_tax_rates: ComponentTaxRate[]
}

export type TaxRateList = {
  $items: TaxRate[]
}

export type ContactPerson = Reference & {
  /**
   * Format: date-time
   * @description The datetime when the item was created
   */
  created_at: string
  /**
   * Format: date-time
   * @description The datetime when the item was last updated
   */
  updated_at: string
  /**
   * Format: date-time
   * @description The datetime when the item was deleted
   */
  deleted_at: string
  /**
   * @description The contact person types for the contact person. Get possible types by retrieving
   * <a href="https://developer.sage.com/accounting/reference/contacts/#operation/getContactPersonTypes">
   *   all available contact person types
   * </a>.
   */
  contact_person_types: Reference[]
  /** @description The name of the contact person */
  name: string
  /** @description The job title of the contact person */
  job_title: string
  /** @description The telephone number of the contact person */
  telephone: string
  /** @description The mobile number of the contact person */
  mobile: string
  /** @description The email address of the contact person */
  email: string
  /** @description The fax number of the contact person */
  fax: string
  /** @description Indicates whether this is the main contact person. Per contact, only one main contact can be selected. */
  is_main_contact: boolean
  address: ReferenceError
  /** @description Indicates whether this contact person is a preferred contact */
  is_preferred_contact: boolean
}

export type ContactTaxTreatment = {
  /** @description Indicates a contact where home country tax rules should be applied */
  home_tax: boolean
  /** @description Indicates a contact where EC tax rules should be applied */
  eu_tax_registered: boolean
  /** @description Indicates an EU contact without a tax number - home tax rules should be applied */
  eu_not_tax_registered: boolean
  /** @description Indicates a contact where rest of world tax rules should be applied */
  rest_of_world_tax: boolean
  /** @description Indicates a contact where import rules should be appliedOnly used for suppliers and FR, ES, IE and UK businesses */
  is_importer: boolean
}

export type ContactCisSettings = {
  /** @description the CIS name for the Contact */
  registered_cis_name: string
  /** @description The CIS Verification number for the contact */
  subcontractor_verification_number: string
  deduction_rate: Reference
}

export type Contact = Reference & {
  /**
   * Format: date-time
   * @description The datetime when the item was created
   */
  created_at: string
  /**
   * Format: date-time
   * @description The datetime when the item was last updated
   */
  updated_at: string
  /** @description Links for the resource */
  links: Link[]
  /**
   * Format: date-time
   * @description The datetime when the item was deleted
   */
  deleted_at: string
  /**
   * Format: double
   * @description The contact balance
   */
  balance: number
  /** @description The type of the contact. It has to be either CUSTOMER or VENDOR */
  contact_types: Reference[]
  /** @description The contact's full name or business name */
  name: string
  /** @description Unique reference for the contact */
  reference: string
  default_sales_ledger_account: LedgerAccount
  default_sales_tax_rate: Reference
  default_purchase_ledger_account: LedgerAccount
  /** @description The VAT registration number of the contact. The format will be validated. */
  tax_number: string
  /** @description The notes for the contact */
  notes: string
  /** @description The locale for the contact */
  locale: string
  main_address: Address
  delivery_address: Address
  main_contact_person: ContactPerson
  bank_account_details: BankAccountDetails
  /**
   * Format: double
   * @description Custom credit limit amount for the contact <br><i>not applicable to Start</i>
   */
  credit_limit: number
  /**
   * Format: int32
   * @description Custom credit days for the contact.<br>
   * If returned as null in a GET response, you may want to GET /invoice_settings
   * and use 'customer_credit_days'/'vendor_credit_days' as default/fallback according
   * to your use case.
   */
  credit_days: number
  /**
   * @description Credit terms options determine how invoice due dates are calculated.
   * Options include: end of next month, a delay of supplier credit_days and immediately.
   * Only: month_end_invoice, date_from_invoice, immediate_invoice, month_end_payment,
   * date_from_payment, immediate_payment are valid values.
   * If returned as null in a GET response, you may want to GET /invoice_settings
   * and use 'customer_credit_terms'/'vendor_credit_terms' as default.
   *
   * @enum {string}
   */
  credit_terms:
    | 'month_end_invoice'
    | 'date_from_invoice'
    | 'immediate_invoice'
    | 'month_end_payment'
    | 'date_from_payment'
    | 'immediate_payment'
  /**
   * @description Custom terms and conditions for the contact. If set will override global /invoice_settings
   * default terms and conditions.
   * <br><i>Customers only</i>
   */
  credit_terms_and_conditions: string
  product_sales_price_type: Reference
  /** @description Used when importing contacts from external sources */
  source_guid: string
  currency: Reference
  /**
   * @description Auxiliary reference. Used for German "Kreditorennummer" and "Debitorennummer".
   * <br>
   * <a href="https://developer.sage.com/accounting/reference/settings/#tag/Datev-Settings">
   *   See Datev Settings endpoint reference
   * </a>
   */
  aux_reference: string
  /** @description The registered number of the contact's business. Only used for German businesses and represents the "Steuernummer" there (not the "USt-ID"). */
  registered_number: string
  /** @description Indicates whether the contact can be deleted successfully */
  deletable: boolean
  tax_treatment: ContactTaxTreatment
  /** @description The email address for the given contact */
  email: string
  /**
   * @description <b>France:</b> The tax calculation method used to define tax
   * treatment <i>Vendors only</i>
   * <br>
   * <b>Spain:</b> Defines if contact is a retailer and tax is subject
   * to Recargo de Equivalencia <i>Customers only</i>
   * <b>United Kingdom:</b> Defines if contact tax treatment is domestic reverse
   * charge <i>Customers & Suppliers</i>
   */
  tax_calculation: string
  /**
   * @description Auxiliary account - used when auxiliary accounting is enabled in business settings.
   * <br><i>Available only in Spain and France</i>
   */
  auxiliary_account: string
  /** @description General Data Protection Regulation (GDPR) came into effect on 25th May 2018. It introduces new rules for how business owners manage their contacts' personal data. When this field returns 'true', means that the contact has been requested to be obfuscated and you can not create any artifact (sales invoices, purchase invoices, ...) but you can still check previously created artifacts. */
  gdpr_obfuscated: boolean
  /** @description Identifies a contact as being a system contact used for processing specific transaction types and reserved specifically for those transaction types such as tax return payments/refunds. */
  system: boolean
  /** @description Indicates whether the contact is associated with any unfinished recurring invoices */
  has_unfinished_recurring_invoices: boolean
  /** @description Identifies a contact as being registered as CIS.<br><i>only applicable to UK business</i> */
  cis_registered: boolean
  /** @description Identifies a contact as being based in Northern Ireland. */
  ni_based: boolean
  /** @description Identifies a contact as being active */
  is_active: boolean
  /** @description Identifies a contact as being based in Great Britain. */
  gb_based: boolean
  cis_settings: ContactCisSettings
  /** @description Identifies a contact should be blocked due to destination vat */
  destination_vat_blocking: boolean
}

export type LedgerEntry = Reference & {
  /**
   * Format: date-time
   * @description The datetime when the item was created
   */
  created_at: string
  /**
   * Format: date-time
   * @description The datetime when the item was last updated
   */
  updated_at: string
  /**
   * Format: date
   * @description The date of the ledger entry
   */
  date: string
  /**
   * Format: double
   * @description The credit amount of the ledger entry
   */
  credit: number
  /**
   * Format: double
   * @description The debit amount of the ledger entry
   */
  debit: number
  ledger_account: LedgerAccount
  transaction: Transaction
  contact: Contact
  /** @description Indicates whether the ledger entry has been deleted or not */
  deleted: boolean
  tax_rate: TaxRate
  /** @description The ledger entry description */
  description: string
  journal_code: JournalCode
}

export type LedgerEntryList = {
  $items: LedgerEntry[]
}

export type TransactionOrigin = Reference & {
  /** @description Links for the resource */
  links: Link[]
  /**
   * Format: date
   * @description The due date of the associated item, e.g. an invoice
   * This attribute is only part of the response when the GET paremeter `expand_origin=true` is set in the request URL. Even then, it is only available on transaction origins found at the following endpoints: ["/contact_opening_balance", "/purchase_corrective_invoice", "/sales_corrective_invoice", "/purchase_credit_note", "/purchase_invoice", "/purchase_quick_entry", "/sales_credit_note", "/sales_estimate", "/sales_invoice", "/sales_quick_entry", "/sales_quote"]. There are other resources, e.g. bank transfers, bank opening balances, or journals, which--though possibly origins of a transaction--can never have this attribute.
   */
  due_date: string
  /**
   * Format: double
   * @description The outstanding amount of the associated item, e.g. an invoice
   * This attribute is only part of the response when the GET paremeter `expand_origin=true` is set in the request URL. Even then, it is only available on transaction origins found at the following endpoints: ["/contact_opening_balance", "/purchase_corrective_invoice", "/sales_corrective_invoice", "/purchase_credit_note", "/purchase_invoice", "/purchase_quick_entry", "/sales_credit_note", "/sales_estimate", "/sales_invoice", "/sales_quick_entry", "/sales_quote"]. There are other resources, e.g. bank transfers, bank opening balances, or journals, which--though possibly origins of a transaction--can never have this attribute.
   */
  outstanding_amount: number
  currency: Reference
  status: Reference
  /**
   * @description Indicates whether the associated item, e.g. an invoice, has been sent. This attribute is only present for sales items (not purchase)
   * This attribute is only part of the response when the GET paremeter `expand_origin=true` is set in the request URL. Even then, it is only available on transaction origins found at the following endpoints: ["/contact_opening_balance", "/purchase_corrective_invoice", "/sales_corrective_invoice", "/purchase_credit_note", "/purchase_invoice", "/purchase_quick_entry", "/sales_credit_note", "/sales_estimate", "/sales_invoice", "/sales_quick_entry", "/sales_quote"]. There are other resources, e.g. bank transfers, bank opening balances, or journals, which--though possibly origins of a transaction--can never have this attribute.
   */
  sent: boolean
}

export type Transaction = Reference & {
  /**
   * Format: date-time
   * @description The datetime when the item was created
   */
  created_at: string
  /**
   * Format: date-time
   * @description The datetime when the item was last updated
   */
  updated_at: string
  /**
   * Format: date
   * @description The date of the transaction
   */
  date: string
  /** @description Indicates whether the transaction has been deleted */
  deleted: boolean
  /** @description The transaction reference */
  reference: string
  /**
   * Format: double
   * @description The transaction total in the base currency
   */
  total: number
  /**
   * Format: double
   * @description The transaction total in the transaction's origin's currency. This is null for some origin types.
   */
  total_in_transaction_currency: number
  contact: Reference
  transaction_type: Reference
  origin: TransactionOrigin
  /** @description The original entity that generated the transaction */
  audit_trail_id: string
  /** @description The number of attachments related to the transaction */
  number_of_attachments: string
}

export type AnalysisTypeLineItem = {
  /** @description The unique identifier for the item */
  id?: string
  /** @description The name of the resource */
  displayed_as?: string
  /** @description The API path for the resource */
  $path?: string
  analysis_type?: AnalysisType
}

export type AnalysisTypeCategory = Reference & {
  /**
   * Format: date-time
   * @description The datetime when the item was created
   */
  created_at?: string
  /**
   * Format: date-time
   * @description The datetime when the item was last updated
   */
  updated_at?: string
  /** @description The code for the analysis type category */
  code?: string
  /** @description The name of the analysis type category */
  name?: string
  /** @description The combined_id of the analysis type category */
  combined_id?: string
  analysis_type?: Reference
}

export type AnalysisType = Reference & {
  /**
   * Format: date-time
   * @description The datetime when the item was created
   */
  created_at?: string
  /**
   * Format: date-time
   * @description The datetime when the item was last updated
   */
  updated_at?: string
  /** @description The areas for which the analysis type is available */
  active_areas?: unknown[]
  /** @description The analysis type level */
  analysis_type_level?: unknown[]
  /** @description The analysis type categories for the analysis type */
  analysis_type_categories?: AnalysisTypeCategory[]
  /** @description The name of the analysis type */
  name?: string
}

export type TaxBreakdown = {
  tax_rate?: Reference
  /**
   * Format: double
   * @description The tax rate percentage
   */
  percentage?: number
  /**
   * Format: double
   * @description The tax amount for the given tax rate
   */
  amount?: number
}

// export type OtherPaymentLine = {
//   ledger_account_id: string
//   total_amount: number
//   tax_rate_id: string
//   details: string
//   analysis_type_categories?: string[]
//   net_amount?: number
//   tax_amount?: number
//   is_purchase_for_resale?: boolean
//   trade_of_asset?: boolean
//   gst_amount?: number
//   pst_amount?: number
//   tax_recoverable?: boolean
// }

// export type OtherPayment = {
//   transaction_type_id: string
//   bank_account_id: string
//   payment_method_id: string
//   date: string
//   total_amount: number
//   reference: string
//   payment_lines: OtherPaymentLine[]
//   base_currency_total_itc_amount?: number
//   total_itc_amount?: number
//   base_currency_total_itr_amount?: number
//   total_itr_amount?: number
//   part_recoverable?: boolean
//   contact_id?: string
//   tax_address_region_id?: string
//   net_amount?: number
//   tax_amount?: number
//   withholding_tax_rate?: number
//   withholding_tax_amount?: number
// }

// export type OtherPaymentResponse = Reference & {
//   created_at: string
//   updated_at: string
//   transaction: Reference
//   transaction_type: Reference
//   deleted_at: string
//   base_currency_total_itc_amount: number
//   total_itc_amount: number
//   base_currency_total_itr_amount: number
//   total_itr_amount: number
//   part_recoverable: boolean
//   payment_method: Reference
//   contact: Reference
//   bank_account: Reference
//   tax_address_region: Reference
//   date: string
//   net_amount: number
//   tax_amount: number
//   total_amount: number
//   reference: string
//   payment_lines: OtherPaymentLinesResponse[]
//   editable?: boolean
//   deletable?: boolean
//   withholding_tax_rate?: number
//   withholding_tax_amount?: number
// }

// export type OtherPaymentLinesResponse = {
//   id: string
//   displayed_as: string
//   analysis_type_categories: AnalysisTypeCategory[]
//   ledger_account: Reference
//   details: string
//   tax_rate: Reference
//   net_amount: number
//   tax_amount: number
//   total_amount: number
//   tax_breakdown: TaxBreakdown[]
//   is_purchase_for_resale: boolean
//   trade_of_asset: boolean
//   gst_amount: number
//   pst_amount: number
//   tax_recoverable: boolean
// }

// export type OtherPaymentRequest = {
//   other_payment: OtherPayment
// }
