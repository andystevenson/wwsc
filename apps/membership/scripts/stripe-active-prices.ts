import { getActivePrices } from "../src/stripe";

console.log("Getting active prices...");
let prices = await getActivePrices();
console.log("Active prices:", prices.length);
