import { db, type DBTransaction } from "../db";
import { type SQLiteTable } from "drizzle-orm/sqlite-core";

export async function insert<T extends {}>(
  table: SQLiteTable,
  object: T,
  tx: DBTransaction | null = null,
) {
  if (tx) {
    let rows = await tx.insert(table).values(object).returning();
    return rows[0];
  }

  let rows = await db.insert(table).values(object).returning();
  return rows[0];
}
