import { readFileSync, writeFileSync } from 'fs'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

const filePath = '/Users/andystevenson/Downloads/ashbourne.db11.csv'
const tempFilePath = '/Users/andystevenson/Downloads/ashbourne.db11.temp.csv'

let csv = readFileSync(filePath, 'utf8')
let records = parse(csv, {
  columns: true,
  skip_empty_lines: true,
  skip_records_with_empty_values: true
})

console.log(records.length)
// @ts-ignore
let newRecords = records.map((record) => {
  let { postcode, address } = record
  if (postcode && address && !address.endsWith(postcode)) {
    record.address = `${address}, ${postcode}`
  }
  return record
})

console.log(newRecords.length)
let newCsv = stringify(newRecords, { header: true })
writeFileSync(tempFilePath, newCsv, 'utf8')
