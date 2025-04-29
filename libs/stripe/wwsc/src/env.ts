import { z, type ZodError } from 'zod'
import { config } from 'dotenv'
import { expand } from 'dotenv-expand'

expand(config())

const Schema = z.object({
  NODE_ENV: z.string().default('development'),
  WWSC_STRIPE_SECRET: z.string().startsWith('sk_live_', 'invalid live key'),
  WWSC_STRIPE_WEBHOOK_SECRET: z
    .string()
    .startsWith('whsec_', 'invalid webhook key'),
  WWSC_STRIPE_TEST_SECRET: z
    .string()
    .startsWith('sk_test_', 'invalid test key'),
  WWSC_STRIPE_TEST_WEBHOOK_SECRET: z
    .string()
    .startsWith('whsec_', 'invalid test webhook key'),
  LOGPATH: z.string().default('/var/lib/wwsc/logs')
})

export type Env = z.infer<typeof Schema>

let env: Env
try {
  env = Schema.parse(process.env)
} catch (error) {
  let e = error as ZodError
  console.error('🤬 @lib/stripe/wwsc: error parsing environment variables')
  console.error(e.flatten().fieldErrors)
  process.exit(1)
}

export { env }
export default env
