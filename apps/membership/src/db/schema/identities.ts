import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import { members } from "./members";

export const identities = sqliteTable("identities", {
  id: text().primaryKey().references(() => members.id),
  card: text(), // card number
  memberNo: text(), // legacy ashbourne member number
  ashId: text(), // legacy ashbourne ID
  ashRef: text(), // legacy ashbourne DD reference
  sumupPos: text(), // customer record on sumup
  stripe: text(), // stripe customer reference if applicable
});

export type InsertIdentity = typeof identities.$inferInsert;
export type SelectIdentity = typeof identities.$inferSelect;
export type UpdateIdentity = Omit<InsertIdentity, "id">;

export const insertIdentitySchema = createInsertSchema(identities);
export const selectIdentitySchema = createSelectSchema(identities);
export const updateIdentitySchema = createInsertSchema(identities);
