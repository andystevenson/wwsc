import { getActiveSubscriptions } from "../src/stripe";

console.log("Getting active subscriptions...");
let subscriptions = await getActiveSubscriptions();
console.log("Active subscriptions:", subscriptions.length);
