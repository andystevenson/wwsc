import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";

export const GenderTypes = ["male", "female", "other", "unknown"] as const;
export type Gender = typeof GenderTypes[number];

export const genders = sqliteTable("genders", {
  id: text().primaryKey().notNull().$default(() => `gender-${nanoid()}`),
  gender: text({ enum: GenderTypes }).notNull().default("unknown"),
  other: text(),
});

export type InsertGender = typeof genders.$inferInsert;
export type SelectGender = typeof genders.$inferSelect;
export type UpdateGender = Omit<InsertGender, "id">;

export const insertGenderSchema = createInsertSchema(genders);
export const selectGenderSchema = createSelectSchema(genders);
export const updateGenderSchema = createInsertSchema(genders);
