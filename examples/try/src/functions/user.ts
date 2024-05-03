import { eq } from 'drizzle-orm'
import { db } from '../db/db.js'
import {
  InsertUser,
  SelectPost,
  SelectUser,
  users,
  posts,
} from '../db/schema.js'

export async function insertUser(data: InsertUser): Promise<void> {
  await db.insert(users).values(data)
}

export async function getUserWithPosts(
  id: SelectUser['id'],
): Promise<Array<{ users: SelectUser; posts: SelectPost | null }>> {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .leftJoin(posts, eq(posts.userId, users.id))
  return user
}

export async function deleteUser(id: SelectUser['id']): Promise<void> {
  await db.delete(users).where(eq(users.id, id))
}
