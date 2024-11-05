import { drizzle } from "drizzle-orm/libsql";
import { and, asc, eq, gte, isNull, lt } from "drizzle-orm";
import { createClient } from "@libsql/client";

export * from "./schema/events";
export * from "./schema/organizers";
export * from "./schema/pricing";
export * from "./schema/attachments";
export * from "./schema/layouts";

if (!process.env.TIMESHEETS_DATABASE_URL) {
  throw new Error("TIMESHEETS_DATABASE_URL is required");
}

const client = createClient({
  url: process.env.TIMESHEETS_DATABASE_URL!,
  authToken: "...",
});

const db = drizzle(client);

export { and, asc, db, eq, gte, isNull, lt };
