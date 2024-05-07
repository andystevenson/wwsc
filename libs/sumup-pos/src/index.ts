import { login, logout } from './sumup-auth'
import { sales, summarizeSales, dailySalesByMethod } from './sales'
import { dailySalesItems } from './sales-items'
import { dailySalesSummaries } from './daily-summaries'
import type {
  DailySummary,
  DailySummarySales,
  RegisterName,
  CardBrand,
  PaymentMethod,
  EntryMode,
  Scope,
} from './Sale'

export type {
  DailySummary,
  DailySummarySales,
  RegisterName,
  CardBrand,
  PaymentMethod,
  EntryMode,
  Scope,
}

export {
  login,
  logout,
  sales,
  summarizeSales,
  dailySalesByMethod,
  dailySalesItems,
  dailySalesSummaries,
}
