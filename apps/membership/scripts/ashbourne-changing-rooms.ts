import { migrateSimpleCategory } from './ashbourne-migrate-category'

const memType = '%Changing Rooms%'
const membership = 'astro-yearly'

await migrateSimpleCategory(memType, membership)
