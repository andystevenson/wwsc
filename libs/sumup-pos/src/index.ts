import { authorization, login, logout } from "./auth";
import { type Staff, staff } from "./staff";
import { sales } from "./sales";
import { dailySalesByPaymentMethod } from "./dailySalesByPaymentMethod";
import { dailySalesSummaries } from "./dailySalesSummaries";
import { dailySalesItems } from "./dailySalesItems";
import { dailySalesCategories } from "./dailySalesCategories";
import {
  type RegisterClosure,
  registerClosures,
  type RegisterPayment,
} from "./registerClosures";

import type {
  CardBrand,
  DailySalesCategory,
  DailySummary,
  DayOfWeek,
  EntryMode,
  PaymentMethod,
  Predicate,
  RegisterName,
  Sale,
  SaleSummary,
  SummarySalesItem,
} from "./Sale";

export type {
  CardBrand,
  DailySalesCategory,
  DailySummary,
  DayOfWeek,
  EntryMode,
  PaymentMethod,
  Predicate,
  RegisterClosure,
  RegisterName,
  RegisterPayment,
  Sale,
  SaleSummary,
  Staff,
  SummarySalesItem,
};

export {
  authorization,
  dailySalesByPaymentMethod,
  dailySalesCategories,
  dailySalesItems,
  dailySalesSummaries,
  login,
  logout,
  registerClosures,
  sales,
  staff,
};

import {
  addToCategory,
  DefaultCategory,
  MultipleCategory,
  SingleCategory,
} from "./salesCategoryGenerators";
export { addToCategory, DefaultCategory, MultipleCategory, SingleCategory };
