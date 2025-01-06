import { and, db, eq, type InsertAshbourneMember, like } from '../db'
import { ashbourne, type AshbourneMember } from '../schema/ashbourne'
import { stripWhitespace, stripAlpha } from '../../utilities/strings'
import { parse } from 'csv-parse/sync'
import capitalize from 'lodash/capitalize'
import camelCase from 'lodash/camelCase'

import { readFileSync } from 'node:fs'

/**
 * Convert a date string from Ashbourne to ISO format
 * @param date dd/mm/yyyy hh:mm:ss
 * @returns YYYY-MM-DDTHH:MM:SS.000Z
 */
export function ashbourneDateToISO(date: string) {
  if (!date) return date
  let [datePart, timePart] = date.split(' ')
  if (!timePart) timePart = '00:00:00'
  let [day, month, year] = datePart.split('/')
  if (day.length === 1) day = `0${day}`
  if (month.length === 1) month = `0${month}`
  if (year.length === 2) year = `20${year}`
  return new Date(`${year}-${month}-${day}T${timePart}`).toISOString()
}

/**
 * Convert a string from Ashbourne to comma separated
 * @param address A string from Ashbourne
 * @returns A comma separated string
 */
export function ashbourneToCommas(s: string) {
  let result = s.trim().replace(/#+/g, ',')
  result = result.replace(/,{2,}/g, ',')
  result = result.replace(/,+$/, '')
  result = result.replace(/\s+,+$/, ',')
  result = result.replace(/^,/, '')
  result = result.replace(/,/g, ', ')
  return result
}

/**
 * Capitalize the first letter of each word in a string
 * @param s A string
 * @returns A string with the first letter of each word capitalized
 */

export function capitalizeFirstLetter(s: string) {
  if (s.includes('-')) {
    return s
      .split('-')
      .map((w) => capitalize(w))
      .join('-')
  }
  return s
    .split(' ')
    .map((w) => capitalize(w))
    .join(' ')
}

export function capitalizeSurname(s: string) {
  if (s.startsWith('Mc')) {
    return `Mc${capitalize(s.slice(2))}`
  }

  if (s.startsWith("O'")) {
    return `O'${capitalize(s.slice(2))}`
  }

  return capitalizeFirstLetter(s)
}
/**
 * Format an Ashbourne address
 * @param address An address from the Ashbourne table
 * @returns A formatted address
 */

export function ashbourneAddress(address: string) {
  return capitalizeFirstLetter(ashbourneToCommas(address))
}

/**
 * Convert an Ashbourne title to a gender
 * @param title A title from the Ashbourne table
 * @returns A gender type
 * Dr
MIss
Mas
Mast
Master
Miss
Mr
Mrs
Ms
mast
 */

export const maleTitles = ['mr', 'master', 'mast', 'mas']
export const femaleTitles = ['mrs', 'miss', 'ms']
export function ashbourneTitleToGender(title: string) {
  title = title.toLowerCase()
  if (maleTitles.includes(title)) return 'male'
  if (femaleTitles.includes(title)) return 'female'
  return 'unknown'
}

/**
 * Format a record from the Ashbourne table
 * @param record A record from the Ashbourne table
 * @returns A transformed record
 */
export function formatAshbourneMember(record: AshbourneMember) {
  // convert all dates to ISO format
  let {
    dob,
    firstName,
    surname,
    additionalDob,
    joinedDate,
    lastPayDate,
    expireDate,
    reviewDate,
    lastVisit
  } = record
  // remove whitespace from these
  let { mobile, postcode, phoneNo, email } = record
  let { address, notes } = record
  return {
    ...record,
    memTitle: ashbourneTitleToGender(record.memTitle),
    firstName: capitalizeFirstLetter(firstName.trim()),
    surname: capitalizeSurname(surname.trim()),
    email: email.trim().toLowerCase(),
    address: ashbourneAddress(address),
    notes: ashbourneToCommas(notes),
    mobile: stripAlpha(stripWhitespace(mobile)),
    postcode: postcode.trim().toUpperCase(),
    phoneNo: stripAlpha(stripWhitespace(phoneNo)),
    dob: ashbourneDateToISO(dob),
    additionalDob: ashbourneDateToISO(additionalDob),
    joinedDate: ashbourneDateToISO(joinedDate),
    lastPayDate: ashbourneDateToISO(lastPayDate),
    expireDate: ashbourneDateToISO(expireDate),
    reviewDate: ashbourneDateToISO(reviewDate),
    lastVisit: ashbourneDateToISO(lastVisit)
  }
}

/**
 * Get all Ashbourne members of a specific type (e.g. "%Cricket%") using drizzle-orm 'like' and 'eq' functions
 * @param memType A string to search for in the memType field
 * @returns An array of transformed records
 */
export async function ashbourneMembers(memType: string | string[]) {
  if (typeof memType === 'string') {
    const op = memType.includes('%') ? like : eq
    let result = await db
      .select()
      .from(ashbourne)
      .where(and(op(ashbourne.memType, memType), eq(ashbourne.status, 'Live')))
    return result
  }

  // if memType is an array
  let result: AshbourneMember[] = []
  for (let memberNo of memType) {
    let records = await db
      .select()
      .from(ashbourne)
      .where(eq(ashbourne.memberNo, memberNo))
    result.push(...records)
  }
  return result
}

/**
 * Load Ashbourne members from a CSV file
 * @param filenameOrCSV A filename or a CSV string
 * @param fromString A boolean to indicate if the first parameter is a string
 * @returns An array of inserted records
 */
export async function loadAshbourne(filenameOrCSV: string, fromString = false) {
  let file = fromString ? filenameOrCSV : readFileSync(filenameOrCSV, 'utf-8')
  let matchFirstLine = file.match(/^(.*)$/m)
  let headerLine = matchFirstLine ? matchFirstLine[1] : ''
  let fields = headerLine.split(',')
  let camelCaseFields = fields.map((f) => camelCase(f))
  let revisedFile = file.replace(headerLine.trim(), camelCaseFields.join(','))
  let data = parse(revisedFile, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  })

  const inserted = await Promise.all(
    data.map(async (d: AshbourneMember) => {
      let td = formatAshbourneMember(d)
      return await db
        .insert(ashbourne)
        .values(td)
        .onConflictDoUpdate({
          target: ashbourne.memberNo,
          set: td
        })
        .returning()
    })
  )
  return inserted.flat()
}

export function coachTypeFromNotes(notes: string) {
  if (notes.includes('[[coach tennis]]')) return 'tennis'
  if (notes.includes('[[coach squash]]')) return 'squash'
  if (notes.includes('[[coach cricket]]')) return 'cricket'
  if (notes.includes('[[coach hockey]]')) return 'hockey'
  if (notes.includes('[[coach gym]]')) return 'gym'
  return 'member'
}

export function companyFromNotes(notes: string) {
  let match = notes.match(/\[\[company ([^\]]+)\]\]/)
  if (match && match.length > 1) return match[1]
  return null
}

export function memTypeToCategory(memType: string) {
  if (memType.includes('Cricket')) return 'cricket'
  if (memType.includes('Hockey')) return 'hockey'
  if (memType.includes('5 - 11')) return 'aged-5-11'
  if (memType.includes('12 - 15')) return 'aged-12-15'
  if (memType.includes('16 - 18')) return 'aged-16-18'
  if (memType.includes('19-25')) return 'young-adult'
  if (memType.includes('3rd Parties')) return 'subcontractor'
  if (memType.includes('Social')) return 'social'
  if (memType.includes('Rooms')) return 'subcontractor'
  if (memType.includes('Coach')) return 'coach'
  if (memType.includes('Concession')) return 'over-65'
  if (memType.includes('Family')) return 'family'
  if (memType.includes('Off Peak')) return 'off-peak'
  if (memType.includes('Owen')) return 'professional'
  if (memType.includes('Staff')) return 'staff'
  if (memType.includes('Standard Annual')) return 'adult'
  if (memType.includes('Standard DD')) return 'adult'
  if (memType.includes('Plus Classes')) return '+classes'
  if (memType.includes('Under')) return 'under-5'
  return null
}
