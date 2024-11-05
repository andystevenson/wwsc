import { getActiveSubscriptionSchedules } from "../src/stripe";

console.log("Getting active subscriptionSchedules...");
let subscriptionSchedules = await getActiveSubscriptionSchedules();
console.log("Active subscriptionSchedules:", subscriptionSchedules.length);
