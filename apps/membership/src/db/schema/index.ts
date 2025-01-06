import * as ashbourne from './ashbourne'
import * as events from './events'
import * as genders from './genders'
import * as identities from './identities'
import * as members from './members'
import * as memberships from './memberships'
import * as campaigns from './campaigns'
import * as campaignMemberships from './campaign-memberships'
import * as notes from './notes'
import * as payments from './payments'
import * as preferences from './preferences'
import * as subscriptions from './subscriptions'
import * as users from './users'
import * as sessions from './sessions'
export * from './ashbourne'
export * from './events'
export * from './genders'
export * from './identities'
export * from './members'
export * from './memberships'
export * from './notes'
export * from './payments'
export * from './preferences'
export * from './subscriptions'
export * from './users'
export * from './campaigns'
export * from './campaign-memberships'
export * from './sessions'
export * from './types'

const schema = {
  schema: {
    ...ashbourne,
    ...events,
    ...genders,
    ...identities,
    ...members,
    ...memberships,
    ...notes,
    ...payments,
    ...preferences,
    ...subscriptions,
    ...users,
    ...campaigns,
    ...campaignMemberships,
    ...sessions
  }
}

export default schema
