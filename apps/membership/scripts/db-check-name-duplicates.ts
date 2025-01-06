import { db, members } from '../src/db'
import { sql } from 'drizzle-orm'

async function main() {
  let all = await db
    .select({ name: sql<string>`concat(${members.name},',',${members.email})` })
    .from(members)
    .groupBy(members.name)

  let duplicates = new Map<string, number>()
  for (let { name } of all) {
    let count = duplicates.get(name) || 0
    duplicates.set(name, count + 1)
  }

  let sorted = Array.from(duplicates.entries()).filter(
    ([_, count]) => count > 1
  )
  console.log('duplicates', sorted)
}

await main()
