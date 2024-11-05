import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const layouts = sqliteTable("layouts", {
  id: text("id")
    .primaryKey()
    .$default(() => `layout_${nanoid()}`),
  adults: integer("adults").default(0),
  kids: integer("kids").default(0),
  westview: integer("westview", { mode: "boolean" }).default(false),
  studio: integer("studio", { mode: "boolean" }).default(false),
  olton: integer("olton", { mode: "boolean" }).default(false),
  warwick: integer("warwick", { mode: "boolean" }).default(false),
  members: integer("members", { mode: "boolean" }).default(false),
  layout: text("layout").default(""),
  food: text("food").default(""),
  dietary: text("dietary").default(""),
  setup: text("setup").default(""),
});

export type Layour = typeof layouts.$inferInsert;
export type SelectLayour = typeof layouts.$inferSelect;
export type UpdateLayour = Omit<Layour, "id">;
