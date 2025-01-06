import { migrateSimpleCategory } from './ashbourne-migrate-category'

let memType = '%Classes Annual%'
let membership = 'classes-yearly'

await migrateSimpleCategory(memType, membership)

memType = '%Classes DD%'
membership = 'classes-monthly'

await migrateSimpleCategory(memType, membership)
