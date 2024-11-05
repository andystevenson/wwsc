import { ashbourneROA } from "../src/db/functions";

async function main() {
  let result = await ashbourneROA();
  console.log("%o", result, result.length);
}

main();
