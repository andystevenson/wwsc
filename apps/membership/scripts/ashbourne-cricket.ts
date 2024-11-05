import { ashbourneCricketers } from "../src/db/functions";

async function main() {
  let result = await ashbourneCricketers();
  console.log("%o", result, result.length);
}

main();
