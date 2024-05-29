import { db } from './client'

// tables
import { posts, type InsertPost, type SelectPost } from './schema/posts'
import { users, type InsertUser, type SelectUser } from './schema/users'
import { sales, type InsertSale, type SelectSale } from './schema/sales'

import {
  salesItems,
  type InsertSalesItem,
  type SelectSalesItem,
} from './schema/sales-items'

import {
  payments,
  type InsertPayment,
  type SelectPayment,
} from './schema/payments'

import {
  paymentSummaries,
  type InsertPaymentSummary,
  type SelectPaymentSummary,
} from './schema/payment-summaries'

import {
  salesCategories,
  type InsertSalesCategory,
  type SelectSalesCategory,
} from './schema/sales-categories'

// functions
import { insertPost, updatePost, deletePost } from './functions/post'
import {
  insertUser,
  updateUser,
  deleteUser,
  getUserWithPosts,
} from './functions/user'

import { insertSale, updateSale, deleteSale } from './functions/sale'

import {
  insertSalesItem,
  updateSalesItem,
  deleteSalesItem,
} from './functions/sales-item'

import {
  insertPayment,
  updatePayment,
  deletePayment,
} from './functions/payment'

import {
  insertPaymentSummary,
  updatePaymentSummary,
  deletePaymentSummary,
} from './functions/payment-summary'

import {
  insertSalesCategory,
  updateSalesCategory,
  deleteSalesCategory,
} from './functions/sales-category'

export { db, posts, users, sales, salesItems, payments, paymentSummaries }
export type {
  InsertPost,
  SelectPost,
  InsertUser,
  SelectUser,
  InsertSale,
  SelectSale,
  InsertSalesItem,
  SelectSalesItem,
  InsertPayment,
  SelectPayment,
  InsertPaymentSummary,
  SelectPaymentSummary,
  InsertSalesCategory,
  SelectSalesCategory,
}
export {
  insertUser,
  insertPost,
  insertSale,
  insertPayment,
  insertSalesItem,
  insertPaymentSummary,
  insertSalesCategory,
}
export {
  updateUser,
  updatePost,
  updateSale,
  updatePayment,
  updateSalesItem,
  updatePaymentSummary,
  updateSalesCategory,
}
export {
  deleteUser,
  deletePost,
  deleteSale,
  deletePayment,
  deleteSalesItem,
  deletePaymentSummary,
  deleteSalesCategory,
}
