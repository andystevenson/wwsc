import { db } from './client'
import { posts, type InsertPost, type SelectPost } from './schema/posts'
import { users, type InsertUser, type SelectUser } from './schema/users'
import { sales, type InsertSale, type SelectSale } from './schema/sales'
import {
  dailySalesSummaries,
  type SelectDailySalesSummary,
  type InsertDailySalesSummary,
} from './schema/daily-sales-summaries'

import {
  saleItems,
  type InsertSaleItem,
  type SelectSaleItem,
} from './schema/sale-items'

import {
  payments,
  type InsertPayment,
  type SelectPayment,
} from './schema/payments'

import { insertPost, updatePost, deletePost } from './functions/post'
import {
  insertUser,
  updateUser,
  deleteUser,
  getUserWithPosts,
} from './functions/user'

import { insertSale, updateSale, deleteSale } from './functions/sale'

import {
  insertSaleItem,
  updateSaleItem,
  deleteSaleItem,
} from './functions/sale-item'

import {
  insertPayment,
  updatePayment,
  deletePayment,
} from './functions/payment'

import {
  insertDailySalesSummary,
  updateDailySalesSummary,
  deleteDailySalesSummary,
} from './functions/daily-sales-summary'

export { db, posts, users, sales, saleItems, payments, dailySalesSummaries }
export type {
  InsertPost,
  SelectPost,
  InsertUser,
  SelectUser,
  InsertSale,
  SelectSale,
  InsertSaleItem,
  SelectSaleItem,
  InsertPayment,
  SelectPayment,
  InsertDailySalesSummary,
  SelectDailySalesSummary,
}
export {
  insertUser,
  insertPost,
  insertSale,
  insertPayment,
  insertSaleItem,
  insertDailySalesSummary,
}
export {
  updateUser,
  updatePost,
  updateSale,
  updatePayment,
  updateSaleItem,
  updateDailySalesSummary,
}
export {
  deleteUser,
  deletePost,
  deleteSale,
  deletePayment,
  deleteSaleItem,
  deleteDailySalesSummary,
}
