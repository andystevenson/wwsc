import { z, type ZodError } from 'zod'
import { config } from 'dotenv'
import { expand } from 'dotenv-expand'
import { Levels } from '@lib/pino'

expand(config())

const Schema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  WWSC_WEBHOOKS_PORT: z.coerce.number().default(6231),
  WWSC_LOG_LEVEL: z.enum(Levels).default('info'),
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
