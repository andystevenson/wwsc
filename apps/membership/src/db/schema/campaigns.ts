import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import { now } from "@wwsc/lib-dates";
import { users } from "./users";

export const campaigns = sqliteTable("campaigns", {
  id: text().primaryKey().notNull().$default(() => `campaign-${nanoid()}`),
  name: text().notNull().unique(),
  created: text().notNull().default(now()),
  createdBy: text().references(() => users.id),
  start: text().notNull().default(now()),
  end: text().notNull().default(now()),
  description: text(),
});

export type InsertCampaign = typeof campaigns.$inferInsert;
export type SelectCampaign = typeof campaigns.$inferSelect;
export type UpdateCampaign = Omit<InsertCampaign, "id">;

export const insertCampaignSchema = createInsertSchema(campaigns);
export const selectCampaignSchema = createSelectSchema(campaigns);
export const updateCampaignSchema = createInsertSchema(campaigns);
