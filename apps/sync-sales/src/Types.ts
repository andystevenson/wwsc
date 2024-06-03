import type { SummarySalesItem, Predicate } from '@wwsc/lib-sumup-pos'
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
  'DELETED_CASH',
  'DELETED_CARD',
  'DELETED_SUMUP',
  'DELETED_VOUCHER',
] as const

type SageScope = (typeof SageCategories)[number]

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

const isDeleted = (item: SummarySalesItem) => item.category === 'DELETED'
const isDeletedCard = (item: SummarySalesItem) =>
  item.card !== 0 && isDeleted(item)
const isDeletedCash = (item: SummarySalesItem) =>
  item.cash !== 0 && isDeleted(item)
const isDeletedSumup = (item: SummarySalesItem) =>
  item.sumup !== 0 && isDeleted(item)
const isDeletedVoucher = (item: SummarySalesItem) =>
  item.voucher !== 0 && isMisc(item)

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
  DELETED_CASH: isDeletedCash,
  DELETED_CARD: isDeletedCard,
  DELETED_SUMUP: isDeletedSumup,
  DELETED_VOUCHER: isDeletedVoucher,
}
