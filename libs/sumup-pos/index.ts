console.log('sumup-pos/index.ts')

import { login, logout } from './src/auth'
import { registerClosures } from './src/index'

await login()
const result = await registerClosures()
console.log('%o', result)
await logout()
