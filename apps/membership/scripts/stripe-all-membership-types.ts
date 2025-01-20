import { getAllMembershipTypes } from '@lib/stripe/wwsc'

let allMembershipTypes = await getAllMembershipTypes()
console.log('all membership types:', allMembershipTypes.length)
