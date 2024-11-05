import * as ashbourne from "./ashbourne";
import { campaigns } from "./campaigns";
import * as events from "./events";
import * as genders from "./genders";
import * as identities from "./identities";
import * as members from "./members";
import * as membershipTypes from "./membership-types";
import * as notes from "./notes";
import * as payments from "./payments";
import * as preferences from "./preferences";
import * as subscriptions from "./subscriptions";
import * as users from "./users";
export * from "./ashbourne";
export * from "./events";
export * from "./genders";
export * from "./identities";
export * from "./members";
export * from "./membership-types";
export * from "./notes";
export * from "./payments";
export * from "./preferences";
export * from "./subscriptions";
export * from "./users";
export * from "./campaigns";
export * from "./types";

const schema = {
  schema: {
    ...ashbourne,
    ...events,
    ...genders,
    ...identities,
    ...members,
    ...membershipTypes,
    ...notes,
    ...payments,
    ...preferences,
    ...subscriptions,
    ...users,
    ...campaigns,
  },
};

export default schema;
