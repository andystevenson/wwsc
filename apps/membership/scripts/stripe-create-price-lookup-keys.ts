import { getAllPrices, stripe } from "../src/stripe";

console.log("Creating lookup keys...");
let prices = await getAllPrices();
let needsKeys = prices.filter((p) => p.active);
console.log("Lookup keys:", needsKeys.length);

const updates = needsKeys.map(async (price) => {
  let { id, nickname, lookup_key } = price;
  if (!lookup_key && nickname) {
    try {
      await stripe.prices.update(id, { lookup_key: nickname });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error updating price ${id}:`, error.message);
        return;
      }
      console.error(`Error updating price ${id}:`, error, nickname);
    }
  }
});

Promise.all(updates).then(() => {
  console.log(`Lookup keys created for ${updates.length}.`);
});
