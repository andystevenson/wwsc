import { getActiveSubscriptions, getAllPrices } from "../src/stripe";

console.log("Looking for archived prices in subscriptions...");
let prices = await getAllPrices();
let subscriptions = await getActiveSubscriptions();

let count = 0;
for (let subscription of subscriptions) {
  let { price, name, email, id } = subscription;
  let found = prices.find((p) =>
    p.id === price && p.active === false && !p.metadata?.campaign
  );
  if (found) {
    let { nickname, lookup_key } = found;
    count++;
    console.log(
      "Subscription:",
      name,
      email,
      id,
      price,
      lookup_key,
      nickname,
      "price is archived",
    );
  }
}
console.log("archived prices in subscriptions:", count);
