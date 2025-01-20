import { $ } from 'bun'
import { exit } from 'node:process'

try {
  console.log('ashbourne migration started ...')

  console.log('clean database')
  await $`rm /var/lib/wwsc/membership.db`.quiet()

  console.log('creating database schema')
  await $`drizzle-kit push --force`.quiet()

  console.log('seeding system users')
  await $`bun ./scripts/db-seed-users.ts`.quiet()

  console.log('loading ashbourne legacy members ...')
  let legacy =
    await $`bun scripts/ashbourne-load.ts ~/ashbourne-final/ashbourne.final.csv`.text()
  console.log(legacy)

  console.log('seeding default membership types')
  let types = await $`bun scripts/db-seed-membership-types.ts`.text()
  console.log(types)

  console.log('seeding campaigns')
  let campaigns = await $`bun scripts/db-seed-campaigns.ts`.text()
  console.log(campaigns)

  console.log('activating campaigns')
  let activation = await $`bun scripts/db-campaign-activation.ts`.text()
  console.log(activation)
} catch (error) {
  console.error('ashbourne migration failed!!!', error)
  exit(1)
}
