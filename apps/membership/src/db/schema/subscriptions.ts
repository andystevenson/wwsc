import { AnySQLiteColumn, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import { never, now } from "@wwsc/lib-dates";
import { PaymentTypes } from "./payments";
import { membershipTypes } from "./membership-types";

export const SubscriptionScope = [
  "individual",
  "family",
  "group",
] as const;
export const SubscriptionStatus = ["active", "cancelled", "suspended"] as const;

export const subscriptions = sqliteTable("subscriptions", {
  id: text().primaryKey().notNull().$default(() => `subscription-${nanoid()}`),
  type: text().references(() => membershipTypes.id).notNull(),
  payment: text({ enum: PaymentTypes }).default("stripe").notNull(),
  scope: text({ enum: SubscriptionScope }).default("individual").notNull(),
  status: text({ enum: SubscriptionStatus }).default("active").notNull(),
  started: text().notNull().default(now()), // date
  renews: text().notNull().default(now()), // date
  ref: text(), // stripe ref, bacs ref, cash ref, sage ref....
  with: text().references((): AnySQLiteColumn => subscriptions.id), // for individual+group
});

export type InsertSubscription = typeof subscriptions.$inferInsert;
export type SelectSubscription = typeof subscriptions.$inferSelect;
export type UpdateSubscription = Omit<InsertSubscription, "id">;

export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const selectSubscriptionSchema = createSelectSchema(subscriptions);
export const updateSubscriptionSchema = createInsertSchema(subscriptions);
