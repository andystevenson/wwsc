import { db, ashbourne, eq } from '../src/db/db'
import { writeFileSync } from 'node:fs'

let all = await db
  .select({ memberNo: ashbourne.memberNo, notes: ashbourne.notes })
  .from(ashbourne)
  .where(eq(ashbourne.status, 'Live'))

let longNotes = all.filter((member) => member.notes.length > 500)
let annotatedNotes = longNotes.map((member) => ({
  ...member,
  length: member.notes.length
}))

console.log('Members with notes over 500 characters:', longNotes.length)

writeFileSync(
  'ashbourne-notes-over-500ch.json',
  JSON.stringify(annotatedNotes, null, 2)
)
