import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
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

export type Preference = typeof PreferenceTypes[number];

export const preferences = sqliteTable("preferences", {
  type: text({ enum: PreferenceTypes }).notNull().default("gym"),
  member: text().references(() => members.id),
}, (table) => {
  let key = primaryKey({ columns: [table.type, table.member] });
  return { key };
});

export type InsertPreference = typeof preferences.$inferInsert;
export type SelectPreference = typeof preferences.$inferSelect;
export type UpdatePreference = Omit<InsertPreference, "id">;

export const insertPreferenceSchema = createInsertSchema(preferences);
export const selectPreferenceSchema = createSelectSchema(preferences);
export const updatePreferenceSchema = createInsertSchema(preferences);
