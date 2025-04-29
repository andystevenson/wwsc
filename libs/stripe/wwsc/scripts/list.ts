import { env } from '@lib/stripe/wwsc'
async function main() {
  console.log('Hello, World!', env)
}

await main()
