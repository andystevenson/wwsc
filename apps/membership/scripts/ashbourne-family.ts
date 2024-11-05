import { ashbourneFamily } from "../src/db/functions";

async function main() {
  let result = await ashbourneFamily();
  console.log("%o", result, result.length);
}

main();
