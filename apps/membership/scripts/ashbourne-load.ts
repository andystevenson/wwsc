import { parse } from 'csv-parse/sync'
import { readFileSync } from 'node:fs'
import { exit } from 'node:process'
import { db, ashbourne } from '../src/db/db'

const filename = Bun.argv[2]
if (!filename) {
  console.error('Usage: ashbourne-load <filename>')
  exit(1)
}

let data = readFileSync(filename, 'utf-8')
let records = parse(data, { columns: true })
console.log('loaded %d records', records.length)

// @ts-ignore
await Promise.all(records.map((record) => db.insert(ashbourne).values(record)))
