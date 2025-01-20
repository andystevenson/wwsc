import { getActiveProducts } from '@lib/stripe/wwsc'

console.log('Getting active products...')
let products = await getActiveProducts()
console.log('Active products:', products.length)
