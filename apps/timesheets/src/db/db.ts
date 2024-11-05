import { drizzle } from "drizzle-orm/libsql";
import { and, asc, eq, gte, isNull, lt } from "drizzle-orm";
import { createClient } from "@libsql/client";
import {
  type InsertShift,
  type SelectShift,
  shifts,
  type UpdateShift,
} from "./schema/shifts";

import {
  holidays,
  type InsertHoliday,
  type SelectHoliday,
  type UpdateHoliday,
} from "./schema/holidays";

if (!process.env.TIMESHEETS_DATABASE_URL) {
  throw new Error("TIMESHEETS_DATABASE_URL is required");
}

const client = createClient({
  url: process.env.TIMESHEETS_DATABASE_URL!,
  authToken: "...",
});

const db = drizzle(client);

export {
  and,
  asc,
  db,
  eq,
  gte,
  holidays,
  type InsertHoliday,
  type InsertShift,
  isNull,
  lt,
  type SelectHoliday,
  type SelectShift,
  shifts,
  type UpdateHoliday,
  type UpdateShift,
};
