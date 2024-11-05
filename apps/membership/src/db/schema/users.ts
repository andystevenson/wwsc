import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";

export const UserAccess = ["owner", "admin", "user"] as const;

export const users = sqliteTable("users", {
  id: text().primaryKey().notNull().$default(() => `user-${nanoid()}`),
  name: text().notNull(),
  email: text().notNull().unique(),
  access: text({ enum: UserAccess }).notNull().default("user"),
});

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type UpdateUser = Omit<InsertUser, "id">;

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const updateUserSchema = createInsertSchema(users);
