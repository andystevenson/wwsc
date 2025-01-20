import { getAllPrices } from '@lib/stripe/wwsc'

console.log('Getting all prices...')
let prices = await getAllPrices()
console.log('All prices:', prices.length)
