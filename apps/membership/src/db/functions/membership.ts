import { db, eq, memberships } from '../db'

/**
 * Get membership type by name
 * @param type
 * @returns Membership
 */

export async function getMembership(id: string) {
  let result = await db.query.memberships.findFirst({
    where: eq(memberships.id, id)
  })
  if (!result) throw TypeError(`membership ${id} not found`)
  return result
}
