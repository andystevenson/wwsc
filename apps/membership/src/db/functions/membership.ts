import { db, eq, type Membership, memberships } from "../db";

/**
 * Get membership type by name
 * @param type
 * @returns SelectMembershipType
 */

export async function getMembership(id: string) {
  let result = await db.query.memberships.findFirst({
    where: eq(memberships.id, id),
  });
  if (!result) throw TypeError(`MembershipType ${id} not found`);
  return result;
}
