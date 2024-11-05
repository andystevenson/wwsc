import { blob, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { events } from "./events";

export const attachments = sqliteTable("attachments", {
  id: text("id")
    .primaryKey()
    .$default(() => `attachment_${nanoid()}`),
  date: text("date").notNull(),
  name: text("name").notNull(),
  file: blob("file").notNull(),
  type: text("type").notNull(),
  event: text("event").references(() => events.id),
});

export type Attachment = typeof attachments.$inferInsert;
export type SelectAttachment = typeof attachments.$inferSelect;
export type UpdateAttachment = Omit<Attachment, "id">;
