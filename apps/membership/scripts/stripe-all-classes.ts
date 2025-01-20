import { getAllClasses } from '@lib/stripe/wwsc'

let allClasses = await getAllClasses()
console.log('all classes types:', allClasses.length)
