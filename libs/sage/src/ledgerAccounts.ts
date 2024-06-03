import type { LedgerAccountList, LedgerAccount } from './Types'
import { GET } from './GET'

export type { LedgerAccountList, LedgerAccount }

export const UsedLedgers = [
  'Bar Dry (4005)',
  'Bar Wet (4007)',
  'Venue Wet (4008)',
  'Venue Dry (4009)',
  'Vending sales (4010)',
  'Tea & Coffee (4011)',
  'Member voucher payments (8207)',
  'Bank Charges (7901)',
]

export const getLedgerAccounts = async (bearer: string) => {
  const getLedgerAccountsData = GET<LedgerAccountList>(
    'ledger_accounts',
    bearer,
    {
      visible_in: 'other_receipts',
      items_per_page: '200',
    },
  )
  const ledgerAccounts = await getLedgerAccountsData()

  let list = ledgerAccounts.$items.filter((ledger) => {
    return UsedLedgers.includes(ledger.displayed_as)
  })
  return list
}

export const ledgerIds = (ledgers: LedgerAccount[]) => {
  let ledger = null

  const barDry = ledgers.find(
    (ledger) => ledger.displayed_as === UsedLedgers[0],
  )
  const barWet = ledgers.find(
    (ledger) => ledger.displayed_as === UsedLedgers[1],
  )

  const venueWet = ledgers.find(
    (ledger) => ledger.displayed_as === UsedLedgers[2],
  )

  const venueDry = ledgers.find(
    (ledger) => ledger.displayed_as === UsedLedgers[3],
  )
  const vending = ledgers.find(
    (ledger) => ledger.displayed_as === UsedLedgers[4],
  )
  const teaCoffee = ledgers.find(
    (ledger) => ledger.displayed_as === UsedLedgers[5],
  )

  const vouchers = ledgers.find(
    (ledger) => ledger.displayed_as === UsedLedgers[6],
  )

  const bankCharges = ledgers.find(
    (ledger) => ledger.displayed_as === UsedLedgers[7],
  )

  if (
    !barDry ||
    !barWet ||
    !venueWet ||
    !venueDry ||
    !vending ||
    !teaCoffee ||
    !vouchers ||
    !bankCharges
  ) {
    throw new Error('WWC ledger account not found')
  }

  const ids = {
    barDry: barDry.id,
    barWet: barWet.id,
    venueWet: venueWet.id,
    venueDry: venueDry.id,
    vending: vending.id,
    teaCoffee: teaCoffee.id,
    vouchers: vouchers.id,
    bankCharges: bankCharges.id,
  }

  return ids
}

export type LedgerIds = ReturnType<typeof ledgerIds>
