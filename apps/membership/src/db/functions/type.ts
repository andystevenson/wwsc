import { db, eq, type Membership, membershipTypes } from "../db";

/**
 * Get membership type by name
 * @param type
 * @returns SelectMembershipType
 */

export async function getTypeByName(type: Membership) {
  let result = await db.query.membershipTypes.findFirst({
    where: eq(membershipTypes.type, type),
  });
  if (!result) throw TypeError(`MembershipType ${type} not found`);
  return result;
}
