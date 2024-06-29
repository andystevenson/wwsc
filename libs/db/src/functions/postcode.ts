import { eq } from 'drizzle-orm'
import { db } from '../client.js'
import { InsertPostcode, SelectPostcode, postcodes } from '../schema/postcodes'

export async function insertPostcode(data: InsertPostcode): Promise<void> {
  await db.insert(postcodes).values(data)
}

export async function updatePostcode(
  postcode: SelectPostcode['postcode'],
  data: Partial<Omit<SelectPostcode, 'postcode'>>,
): Promise<SelectPostcode[]> {
  const updatedPost = await db
    .update(postcodes)
    .set(data)
    .where(eq(postcodes.postcode, postcode))
    .returning()
  return updatedPost
}

export async function deletePostcode(
  postcode: SelectPostcode['postcode'],
): Promise<void> {
  await db.delete(postcodes).where(eq(postcodes.postcode, postcode))
}
