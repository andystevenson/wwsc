import { readFileSync, writeFileSync } from 'fs'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

const filePath = '/Users/andystevenson/Downloads/ashbourne.db11.temp.csv'
const tempFilePath = '/Users/andystevenson/Downloads/ashbourne.db12.csv'

let csv = readFileSync(filePath, 'utf8')
let records = parse(csv, {
  columns: true,
  skip_empty_lines: true,
  skip_records_with_empty_values: true
})

console.log(records.length)
// @ts-ignore
let newRecords = records.map((record) => {
  let { memberNo, firstName, surname, postcode, address } = record
  let parts = address.split(',')
  if (parts.length === 0) return record
  if (parts.length === 1) {
    console.log('length 1', memberNo, firstName, surname, `[${address}]`)
    return record
  }

  if (parts.length > 4) {
    console.log('length > 4', memberNo, firstName, surname, `[${address}]`)
    return record
  }
  return record
})

console.log(newRecords.length)
let newCsv = stringify(newRecords, { header: true })
writeFileSync(tempFilePath, newCsv, 'utf8')
