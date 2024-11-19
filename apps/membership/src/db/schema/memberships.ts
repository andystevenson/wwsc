import {
  AnySQLiteColumn,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { now } from "@wwsc/lib-dates";

export const MembershipTypes = [
  "hockey",
  "cricket",
  "social",
  "family",
  "with-classes",
  "adult",
  "off-peak",
  "over-65",
  "young-adult",
  "student",
  "aged-16-18",
  "aged-12-15",
  "aged-5-11",
  // non-paying memberships
  "under-5",
  "honorary",
  "coach",
  "staff",
  "visiting-professional",
  "astro",
  "subcontractor",
  "guest-of",
  // test memberships types for debugging
  "test",
] as const;

export type Membership = typeof MembershipTypes[number];

export const MembershipIntervals = ["month", "year"] as const;
export type MembershipInterval = typeof MembershipIntervals[number];

export const MembershipTypeStatus = [
  "active",
  "suspended",
  "withdrawn",
] as const;
export type MembershipStatus = typeof MembershipTypeStatus[number];

export const memberships = sqliteTable("memberships", {
  id: text().primaryKey().notNull(),
  type: text({ enum: MembershipTypes }).notNull(),
  status: text({ enum: MembershipTypeStatus }).notNull().default("active"),
  description: text().default(""),
  effectiveDate: text().notNull().default(now()),
  interval: text({ enum: MembershipIntervals }).notNull().default("month"),
  intervals: integer({ mode: "number" }).notNull().default(1),
  iterations: integer({ mode: "number" }).notNull().default(1),
  then: text().references((): AnySQLiteColumn => memberships.id),
  paying: integer({ mode: "boolean" }).notNull().default(true),
  price: real().notNull().default(0),
  stripePrice: text(),
  stripeProduct: text(),
});

export type InsertMembership = typeof memberships.$inferInsert;
export type SelectMembership = typeof memberships.$inferSelect;
export type UpdateMembership = Omit<InsertMembership, "id">;

export const insertMembershipSchema = createInsertSchema(memberships);
export const selectMembershipSchema = createSelectSchema(memberships);
export const updateMembershipSchema = createInsertSchema(memberships);
