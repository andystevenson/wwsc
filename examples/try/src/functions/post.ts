import { eq } from 'drizzle-orm'
import { db } from '../db/db.js'
import { InsertPost, SelectPost, posts } from '../db/schema.js'

export async function insertPost(data: InsertPost): Promise<void> {
  await db.insert(posts).values(data)
}

export async function patchPost(
  id: SelectPost['id'],
  data: Partial<Omit<SelectPost, 'id'>>,
): Promise<SelectPost[]> {
  const updatedPost = await db
    .update(posts)
    .set(data)
    .where(eq(posts.id, id))
    .returning()
  return updatedPost
}
