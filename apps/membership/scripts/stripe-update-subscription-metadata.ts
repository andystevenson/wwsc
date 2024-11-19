import {
  type FormattedSubscription,
  getActiveSubscriptions,
  updateSubscriptionMetadata,
} from "../src/stripe";
import {
  and,
  ashbourne,
  db,
  eq,
  type SelectAshbourneMember,
} from "../src/db/db";

console.log("Updating subscription metadata...");
let subscriptions = await getActiveSubscriptions();
console.log("active subscriptions:", subscriptions.length);

for (let subscription of subscriptions) {
  let { config, id } = subscription;
  if (!config.memberNo) continue;
  let memberNo = config.memberNo;
  let member = await db.query.ashbourne.findFirst({
    where: eq(ashbourne.memberNo, memberNo),
  });
  if (!member) {
    console.log("No member for memberNo:", memberNo, id);
    continue;
  }

  let { firstName, surname, memType, email, status } = member;

  let relations: string[] = [];
  if (config.dependents) {
    let { dependents } = config;
    let listOfDependents = JSON.parse(dependents);
    if (Array.isArray(listOfDependents)) {
      for (let dependent of listOfDependents) {
        if (!dependent) {
          console.error("No memberNo for dependent", dependent, id);
        }
        let dependentMember = await db.query.ashbourne.findFirst({
          where: eq(ashbourne.memberNo, dependent),
        });
        if (!dependentMember) {
          console.log("No member for dependent:", dependent, id);
          continue;
        }
        let { firstName, surname, memType, email, status } = dependentMember;
        relations.push(
          `${dependent}:${firstName} ${surname}:${email}:${memType}:${status}`,
        );
      }
    }
  }
  console.log(
    "Updating subscription:",
    id,
    `${firstName} ${surname} : ${memberNo}`,
  );
  await updateSubscriptionMetadata(id, {
    relations: relations.length ? relations.join("\n") : "",
    firstName,
    surname,
    memType,
    email,
    status,
  });
}

console.log("Done.");
