import { eq } from 'drizzle-orm'
import { db } from '../client.js'
import { InsertPost, SelectPost, posts } from '../schema/posts'

export async function insertPost(data: InsertPost): Promise<void> {
  await db.insert(posts).values(data)
}

export async function updatePost(
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

export async function deletePost(id: SelectPost['id']): Promise<void> {
  await db.delete(posts).where(eq(posts.id, id))
}
