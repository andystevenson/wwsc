import env from './utilities/env'
import app from './app'

const port = env.EVENTS_PORT
console.log('Starting Events Server...', port)
const server = Bun.serve({ port, fetch: app.fetch })
