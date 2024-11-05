import {
  AnySQLiteColumn,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import { now } from "@wwsc/lib-dates";
import { campaigns } from "./campaigns";

export const MembershipTypes = [
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
  "under-5",
  "honorary",
  "coach",
  "staff",
  "visiting-professional",
  "cricket",
  "hockey",
  "astro",
  "subcontractor",
  "test",
] as const;

export type Membership = typeof MembershipTypes[number];

export const MembershipFrequencies = ["monthly", "annual", "forever"] as const;
export type MembershipFrequency = typeof MembershipFrequencies[number];

export const MembershipTypeStatus = [
  "active",
  "suspended",
  "withdrawn",
] as const;
export type MembershipStatus = typeof MembershipTypeStatus[number];

export const membershipTypes = sqliteTable("membershipTypes", {
  id: text().primaryKey().$default(() => `type-${nanoid()}`).notNull(),
  type: text({ enum: MembershipTypes }).notNull().default("social"),
  status: text({ enum: MembershipTypeStatus }).notNull().default("active"),
  name: text().notNull(),
  description: text().notNull(),
  version: integer({ mode: "number" }).default(1).notNull(),
  effectiveDate: text().notNull().default(now()),
  frequency: text({ enum: MembershipFrequencies }).notNull().default("monthly"),
  iterations: integer({ mode: "number" }).notNull().default(0),
  then: text().references((): AnySQLiteColumn => membershipTypes.id),
  campaign: text().references(() => campaigns.id),
  paying: integer({ mode: "boolean" }).notNull().default(true),
  discounted: integer({ mode: "boolean" }).notNull().default(false),
  price: real().notNull().default(0),
  stripePrice: text(),
});

export type InsertMembershipType = typeof membershipTypes.$inferInsert;
export type SelectMembershipType = typeof membershipTypes.$inferSelect;
export type UpdateMembershipType = Omit<InsertMembershipType, "id">;

export const insertMembershipTypeSchema = createInsertSchema(membershipTypes);
export const selectMembershipTypeSchema = createSelectSchema(membershipTypes);
export const updateMembershipTypeSchema = createInsertSchema(membershipTypes);
