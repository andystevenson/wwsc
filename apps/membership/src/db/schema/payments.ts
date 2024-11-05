import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import { never } from "@wwsc/lib-dates";
import { members } from "./members";

export const PaymentTypes = [
  "stripe",
  "sumup",
  "cash",
  "bacs",
  "free",
] as const;

export const payments = sqliteTable("payments", {
  id: text().primaryKey().notNull().$default(() => `payment-${nanoid()}`),
  description: text(),
  type: text({ enum: PaymentTypes }).default("stripe").notNull(),
  date: text().notNull().default(never()), // ISO date
  ref: text(), // actually a foreign key
  member: text().references(() => members.id),
});

export type InsertPayment = typeof payments.$inferInsert;
export type SelectPayment = typeof payments.$inferSelect;
export type UpdatePayment = Omit<InsertPayment, "id">;

export const insertPaymentSchema = createInsertSchema(payments);
export const selectPaymentSchema = createSelectSchema(payments);
export const updatePaymentSchema = createInsertSchema(payments);
