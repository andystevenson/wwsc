import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import { now } from "@wwsc/lib-dates";
import { users } from "./users";
import { members } from "./members";
import { campaigns } from "./campaigns";

export const Formats = [
  "text/markdown",
  "text/html",
  "text/plain",
  "text/csv",
  "image/png",
  "image/jpeg",
  "image/avif",
  "image/svg+xml",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
] as const;

export const notes = sqliteTable("notes", {
  id: text().primaryKey().notNull().$default(() => `note-${nanoid()}`),
  date: text().notNull().default(now()),
  content: text().notNull().default(""),
  format: text({ enum: Formats }).notNull().default("text/plain"),
  createdBy: text().references(() => users.id).notNull(),
  member: text().references(() => members.id),
  campaign: text().references(() => campaigns.id),
});

export type InsertNote = typeof notes.$inferInsert;
export type SelectNote = typeof notes.$inferSelect;
export type UpdateNote = Omit<InsertNote, "id">;

export const insertNoteSchema = createInsertSchema(notes);
export const selectNoteSchema = createSelectSchema(notes);
export const updateNoteSchema = createInsertSchema(notes);
