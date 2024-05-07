import { eq } from 'drizzle-orm'
import { db } from '../client'
import { InsertUser, SelectPost, SelectUser, users, posts } from '../index'

export async function insertUser(data: InsertUser): Promise<void> {
  await db.insert(users).values(data)
}

export async function updateUser(
  id: SelectUser['id'],
  data: Partial<Omit<SelectUser, 'id'>>,
): Promise<SelectUser[]> {
  const updatedUser = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning()
  return updatedUser
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
