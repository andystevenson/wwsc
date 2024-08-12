import env from './utilities/env'
import app from './app'

const port = env.CLOSURES_PORT
console.log('Starting Closures Server...', port)
const server = Bun.serve({ port, fetch: app.fetch })
