console.log('sumup-pos/index.ts')

import { login, logout } from './src/auth'
import { registerClosures } from './src/index'

await login()
const result = await registerClosures()
Bun.write('sumup-pos.json', JSON.stringify(result, null, 2))
await logout()
