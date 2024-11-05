import { AnySQLiteColumn, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import { subscriptions } from "./subscriptions";
import { users } from "./users";
import { genders } from "./genders";

export const MemberStatus = ["live", "expired", "suspended"] as const;

// relative is
// for under 18s this is the parent or guardian
// for over 18s this is a family member (hence discounted subscription)
export const members = sqliteTable("members", {
  id: text().primaryKey().notNull().$default(() => `member-${nanoid()}`),
  firstName: text().notNull().default(""),
  surname: text().notNull().default(""),
  gender: text().references(() => genders.id).notNull(),
  postcode: text(),
  dob: text(), // date of birth (optional)
  status: text({ enum: MemberStatus }).notNull().default("live"),
  mobile: text(),
  email: text(),
  address: text(),
  subscription: text().references(() => subscriptions.id, {
    onDelete: "cascade",
  }).notNull(),
  createdBy: text().references(() => users.id).notNull(),
  relative: text().references((): AnySQLiteColumn => members.id),
});

export type InsertMember = typeof members.$inferInsert;
export type SelectMember = typeof members.$inferSelect;
export type UpdateMember = Omit<InsertMember, "id">;

export const insertMemberSchema = createInsertSchema(members);
export const selectMemberSchema = createSelectSchema(members);
export const updateMemberSchema = createInsertSchema(members);

// TODO: create a member
// TODO: read a member
// TODO: update a member
// TODO: delete a member
// TODO: list all members
// TODO: search for a member
/**
 * m
12 - 15 yrs Annual
16 - 18 yrs Annual
19-25 yrs Annual
19-25 yrs DD
3rd Parties
5 - 11 yrs Annual
Adult Social Membership
Changing Rooms
Coach
Concession Membership
Concession Membership - Annual
Family Membership
Family Membership - Annual
Junior Cricket
Junior Hockey
Off Peak Annual
Off Peak DD
Rob Owen Academy
Staff Member
Standard Annual
Standard Cricket
Standard Cricket & Classes
Standard DD
Standard Hockey
Standard Plus Classes Annual
Standard Plus Classes DD
Under 5s
 */
