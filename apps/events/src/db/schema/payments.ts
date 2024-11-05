import { real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { events } from "./events";

export const payments = sqliteTable("payments", {
  id: text("id")
    .primaryKey()
    .$default(() => `payment_${nanoid()}`),
  towards: text("towards", { enum: ["roomhire", "food", "drinks"] })
    .notNull(),
  date: text("date").notNull(),
  amount: real("food").default(0),
  method: text("method", { enum: ["cash", "card", "bacs"] }).default("cash"),
  type: text("type", { enum: ["deposit", "balance", "part", "full"] }).default(
    "full",
  ),
  notes: text("notes").default(""),
  ref: text("ref"), // reference id in sumup or stripe
  event: text("event").references(() => events.id),
});

export type Pricing = typeof payments.$inferInsert;
export type SelectPricing = typeof payments.$inferSelect;
export type UpdatePricing = Omit<Pricing, "id">;
