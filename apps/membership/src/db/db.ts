import { drizzle } from "drizzle-orm/libsql";
import { and, asc, eq, gte, ilike, isNull, like, lt } from "drizzle-orm";
import { createClient } from "@libsql/client";
import env from "../utilities/env";
import schema from "./schema/schema";
export * from "./functions";
export * from "./schema/schema";

const client = createClient({
  url: env.MEMBERSHIP_DATABASE_URL!,
  authToken: "...",
});

const db = drizzle(client, schema);

export { and, asc, db, eq, gte, ilike, isNull, like, lt };
