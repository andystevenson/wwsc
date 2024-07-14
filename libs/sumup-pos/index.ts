console.log('sumup-pos/index.ts')

import { login, logout } from './src/auth'
import { staff } from './src/staff'

await login()
const result = await staff()
console.log(result)
await logout()
