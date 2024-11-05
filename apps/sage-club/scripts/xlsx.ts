import { dayjs } from '@wwsc/lib-dates'
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'node:fs'
import { xlsx } from '../src/utilities/xlsx'

let file = readFileSync('scripts/stocktake-2024-09.csv')
let csv = parse(file, { columns: true })
await xlsx(csv, 'scripts/stocktake.xlsx')
