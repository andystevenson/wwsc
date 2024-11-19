import { getActiveSubscriptions } from "../src/stripe";

console.log("Looking for unmapped subscriptions...");
let subscriptions = await getActiveSubscriptions();

let count = 0;
for (let subscription of subscriptions) {
  let { name, email, lookup_key, config, id } = subscription;
  if (!config.memberNo) {
    count++;
    console.log(
      "Subscription:",
      name,
      email,
      id,
      lookup_key,
      "is unmapped",
    );
  }
}
console.log("unmapped subscriptions:", count, "of", subscriptions.length);
