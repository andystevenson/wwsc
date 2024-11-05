import { getUserByEmail } from "../src/db/functions";

export async function andy() {
  let result = await getUserByEmail("andy@westwarwicks.co.uk");
  if (!result) throw TypeError("Andy not found");
  return result;
}
