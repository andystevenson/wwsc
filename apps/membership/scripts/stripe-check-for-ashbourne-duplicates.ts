import {
  type FormattedSubscription,
  getActiveSubscriptions,
} from "../src/stripe";

console.log("Looking for ashbourne duplicate memberNos in subscriptions...");
let subscriptions = await getActiveSubscriptions();

type Mapped = Record<string, FormattedSubscription[]>;
let mapped: Mapped = {};

let count = 0;
let memberNos = new Set<string>();
for (let subscription of subscriptions) {
  let { config, id } = subscription;
  if (!config.memberNo) continue;
  let key = config.memberNo;
  mapped[key] = mapped[key] || [];
  mapped[key].push(subscription);
  if (mapped[key].length > 1) {
    count++;
    console.log("Duplicate subscription:", key, mapped[key].map((s) => s.id));
  }

  memberNos.add(key);
  if (config.dependents) {
    let { dependents } = config;
    let listOfDependents = JSON.parse(dependents);
    if (Array.isArray(listOfDependents)) {
      for (let dependent of listOfDependents) {
        if (!dependent) {
          console.error("No memberNo for dependent", dependent, id);
        }
        if (memberNos.has(dependent)) {
          count++;
          console.log("Duplicate dependent:", dependent, id);
        }
        memberNos.add(dependent);
      }
    }
  }
}
console.log("duplicates:", count);
