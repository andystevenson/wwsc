import { real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { events } from "./events";

export const pricing = sqliteTable("pricing", {
  id: text("id")
    .primaryKey()
    .$default(() => `pricing_${nanoid()}`),
  date: text("date").notNull(),
  roomhire: real("roomhire").default(0),
  food: real("food").default(0),
  drinks: real("drinks").default(0),
  notes: text("notes").default(""),
  event: text("event").references(() => events.id),
});

export type Pricing = typeof pricing.$inferInsert;
export type SelectPricing = typeof pricing.$inferSelect;
export type UpdatePricing = Omit<Pricing, "id">;
