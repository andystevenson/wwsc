import { ashbourneHockeyPlayers } from "../src/db/functions";

async function main() {
  let result = await ashbourneHockeyPlayers();
  console.log("%o", result, result.length);
}

main();
