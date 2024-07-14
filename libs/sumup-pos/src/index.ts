import { login, logout } from './auth'
import { sales } from './sales'
import { dailySalesByPaymentMethod } from './dailySalesByPaymentMethod'
import { dailySalesSummaries } from './dailySalesSummaries'
import { dailySalesItems } from './dailySalesItems'
import { dailySalesCategories } from './dailySalesCategories'
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
}

export {
  login,
  logout,
  sales,
  dailySalesSummaries,
  dailySalesByPaymentMethod,
  dailySalesItems,
  dailySalesCategories,
}

import {
  SingleCategory,
  MultipleCategory,
  addToCategory,
  DefaultCategory,
} from './salesCategoryGenerators'
export { SingleCategory, MultipleCategory, addToCategory, DefaultCategory }
