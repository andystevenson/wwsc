import { getAllPrices } from "../src/stripe";

console.log("Getting all prices...");
let prices = await getAllPrices();
console.log("All prices:", prices.length);
