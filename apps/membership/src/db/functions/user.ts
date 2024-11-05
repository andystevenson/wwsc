import { db, eq, users } from "../db";

export async function getUserByEmail(email: string) {
  let result = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  return result;
}
