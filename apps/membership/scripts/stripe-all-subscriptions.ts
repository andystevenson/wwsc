import { getAllSubscriptions } from "../src/stripe";

console.log("Getting all subscriptions...");
let subscriptions = await getAllSubscriptions();
console.log("all subscriptions:", subscriptions.length);
