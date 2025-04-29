import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

export const geo = sqliteTable('geo', {
  postcode: text().primaryKey(),
  longitude: real().notNull(),
  latitude: real().notNull(),
  distance: real().notNull() // from the club in m
})

export const WWSCGeo = {
  longitude: -1.806781,
  latitude: 52.4284
}
export function distance(
  lat1: number,
  lon1: number,
  lat2: number = WWSCGeo.latitude,
  lon2: number = WWSCGeo.longitude
) {
  // Haversine formula
  const R = 6371e3 // metres
  const φ1 = (lat1 * Math.PI) / 180 // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const d = R * c // in metres
  return d
}

export function bounds(geos: Geo[]) {
  let minLat = Infinity
  let maxLat = -Infinity
  let minLon = Infinity
  let maxLon = -Infinity
  for (const geo of geos) {
    minLat = Math.min(minLat, geo.latitude)
    maxLat = Math.max(maxLat, geo.latitude)
    minLon = Math.min(minLon, geo.longitude)
    maxLon = Math.max(maxLon, geo.longitude)
  }
  return {
    minLat,
    maxLat,
    minLon,
    maxLon
  }
}

export type InsertGeo = typeof geo.$inferInsert
export type Geo = typeof geo.$inferSelect
export type UpdateGeo = Omit<InsertGeo, 'id'>

export const insertGeoSchema = createInsertSchema(geo)
export const selectGeoSchema = createSelectSchema(geo)
export const updateGeoSchema = createInsertSchema(geo)
