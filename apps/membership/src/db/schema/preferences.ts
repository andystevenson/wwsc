import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import { members } from "./members";

export const PreferenceTypes = [
  "cricket",
  "football",
  "gym",
  "hockey",
  "padel",
  "squash",
  "tennis",
  "email-marketing",
  "sms-marketing",
] as const;

export const preferences = sqliteTable("preferences", {
  id: text().primaryKey().notNull().$default(() => `preference-${nanoid()}`),
  type: text({ enum: PreferenceTypes }).notNull().default("gym"),
  member: text().references(() => members.id),
});

export type InsertPreference = typeof preferences.$inferInsert;
export type SelectPreference = typeof preferences.$inferSelect;
export type UpdatePreference = Omit<InsertPreference, "id">;

export const insertPreferenceSchema = createInsertSchema(preferences);
export const selectPreferenceSchema = createSelectSchema(preferences);
export const updatePreferenceSchema = createInsertSchema(preferences);
