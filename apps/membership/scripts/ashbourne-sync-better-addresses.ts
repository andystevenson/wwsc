import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'
import { db, ashbourne, eq } from '../src/db/db'

const filePath = '/Users/andystevenson/Downloads/ashbourne.db12.csv'

let csv = readFileSync(filePath, 'utf8')
let records = parse(csv, {
  columns: true,
  skip_empty_lines: true,
  skip_records_with_empty_values: true
})

console.log(records.length)

let count = 0
for (let record of records) {
  let { memberNo, firstName, surname, postcode, address } = record
  let [member] = await db
    .select({
      memberNo: ashbourne.memberNo,
      firstName: ashbourne.firstName,
      surname: ashbourne.surname,
      postcode: ashbourne.postcode,
      address: ashbourne.address
    })
    .from(ashbourne)
    .where(eq(ashbourne.memberNo, memberNo))

  if (!member) {
    throw new Error(`Member not found: ${memberNo}`)
  }

  if (member.postcode !== postcode || member.address !== address) {
    console.log(`Updating ${memberNo}...`)
    console.log(`  postcode: ${member.postcode} -> ${postcode}`)
    console.log(`  address: ${member.address} -> ${address}`)
    await db
      .update(ashbourne)
      .set({ postcode, address })
      .where(eq(ashbourne.memberNo, memberNo))
    count++
  }
}

console.log(count, 'records to update')
