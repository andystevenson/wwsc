import type { LedgerAccountList, LedgerAccount } from './Types'
import { GET } from './GET'

export type { LedgerAccountList, LedgerAccount }

export const getLedgerAccounts = async (code: string) => {
  const getLedgerAccountsData = GET<LedgerAccountList>(
    'ledger_accounts',
    code,
    {
      visible_in: 'other_receipts',
      items_per_page: '200',
    },
  )
  const ledgerAccounts = await getLedgerAccountsData()
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
  let list = ledgerAccounts['$items'].filter((ledger) => {
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
