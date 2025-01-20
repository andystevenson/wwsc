import { Stripe } from 'stripe'
import { db, eq, notes, type InsertNote, ashbourne } from '../db'

export async function customerAshbourneNotes(customer: Stripe.Customer) {
  let { metadata } = customer
  let { memberNo } = metadata
  if (!memberNo) return

  // only update notes if memberNo is present && there is not already notes in the db
  // can only happen the first time the customer is synced
  let [note] = await db
    .select()
    .from(notes)
    .where(eq(notes.member, customer.id))

  if (note) return

  let [noteText] = await db
    .select({ notes: ashbourne.notes })
    .from(ashbourne)
    .where(eq(ashbourne.memberNo, memberNo))

  if (!noteText) return

  let insertNote: InsertNote = {
    member: customer.id,
    createdBy: 'andy@westwarwicks.co.uk',
    content: noteText.notes
  }

  await db.insert(notes).values(insertNote)
}
