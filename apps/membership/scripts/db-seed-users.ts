import { db, type InsertUser, users } from '../src/db'

let admins: InsertUser[] = [
  {
    name: 'Andy Stevenson',
    email: 'andy@westwarwicks.co.uk',
    access: 'owner'
  },
  {
    name: 'Jim Robinson',
    email: 'james.robinson@westwarwicks.co.uk',
    access: 'admin'
  },
  {
    name: 'Angela Taylor',
    email: 'angela@westwarwicks.co.uk',
    access: 'admin'
  },
  {
    name: 'Natalie Bermingham',
    email: 'natalie@westwarwicks.co.uk',
    access: 'admin'
  }
]

async function main() {
  let result = await db.insert(users).values(admins).returning()
  console.log('%o', result)
}

main()
