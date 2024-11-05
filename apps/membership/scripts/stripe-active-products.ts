import { getActiveProducts } from "../src/stripe";

console.log("Getting active products...");
let products = await getActiveProducts();
console.log("Active products:", products.length);
