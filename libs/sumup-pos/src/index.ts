import { login, logout } from './auth'
import { staff, type Staff } from './staff'
import { sales } from './sales'
import { dailySalesByPaymentMethod } from './dailySalesByPaymentMethod'
import { dailySalesSummaries } from './dailySalesSummaries'
import { dailySalesItems } from './dailySalesItems'
import { dailySalesCategories } from './dailySalesCategories'
import { registerClosures } from './registerClosures'

import type {
  DayOfWeek,
  Sale,
  SaleSummary,
  SummarySalesItem,
  DailySummary,
  DailySalesCategory,
  RegisterName,
  CardBrand,
  PaymentMethod,
  EntryMode,
  Predicate,
} from './Sale'

export type {
  DayOfWeek,
  Sale,
  SaleSummary,
  SummarySalesItem,
  DailySummary,
  DailySalesCategory,
  RegisterName,
  CardBrand,
  PaymentMethod,
  EntryMode,
  Predicate,
  Staff,
}

export {
  login,
  logout,
  sales,
  dailySalesSummaries,
  dailySalesByPaymentMethod,
  dailySalesItems,
  dailySalesCategories,
  staff,
  registerClosures,
}

import {
  SingleCategory,
  MultipleCategory,
  addToCategory,
  DefaultCategory,
} from './salesCategoryGenerators'
export { SingleCategory, MultipleCategory, addToCategory, DefaultCategory }
