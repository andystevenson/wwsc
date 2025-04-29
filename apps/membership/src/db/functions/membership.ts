import type { MembershipScope } from '../db'
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

export async function membershipFromLookupKey(lookup_key: string) {
  if (!lookup_key) throw new TypeError('no lookup_key provided')
  let [membership] = await db
    .select()
    .from(memberships)
    .where(eq(memberships.id, lookup_key))

  if (!membership)
    throw new TypeError(`no membership found for lookup_key ${lookup_key}`)

  return membership.id
}

export function scopeFromLookupKey(lookup_key: string): MembershipScope {
  if (lookup_key.includes('club')) return 'club'
  if (lookup_key.includes('family') && !lookup_key.includes('family-member'))
    return 'family'
  return 'individual'
}
