import { db } from "../db";
export type DBTransactionWrapper = typeof db.transaction;
export type DBTransactionCallback = Parameters<DBTransactionWrapper>[0];
export type DBTransaction = Parameters<DBTransactionCallback>[0];
