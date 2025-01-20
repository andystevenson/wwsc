import { getActivePrices } from '@lib/stripe/wwsc'

console.log('Getting active prices...')
let prices = await getActivePrices()
console.log('Active prices:', prices.length)
