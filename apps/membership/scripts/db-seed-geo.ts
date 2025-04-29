import {
  db,
  geo,
  isNotNull,
  type InsertGeo,
  distance,
  members
} from '../src/db'

export async function seedGeos() {
  let geos: InsertGeo[] = []

  let postcodes = await db
    .selectDistinct({ postcode: members.postcode })
    .from(members)
    .where(isNotNull(members.postcode))

  console.log('postcodes', postcodes.length)

  for (let { postcode } of postcodes) {
    if (!postcode) {
      continue
    }

    let res = await postcodeIo(postcode)
    if (!res) {
      continue
    }

    let { longitude, latitude } = res.result

    let insertGeo: InsertGeo = {
      postcode,
      longitude,
      latitude,
      distance: distance(latitude, longitude)
    }

    geos.push(insertGeo)
  }

  // empty the geo data
  await db.delete(geo)
  await db.insert(geo).values(geos)

  console.log('geos', geos.length)
}

export async function main() {
  console.log('seeding geos')
  await seedGeos()
}

async function postcodeIo(postcode: string) {
  let res = await fetch(
    `https://api.postcodes.io/postcodes/${postcode.replace(/\s/g, '')}`
  )

  if (!res.ok) {
    console.error('failed to fetch postcode', postcode)
    return
  }
  let json = await res.json()
  return json
}
await main()
