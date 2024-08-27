import app from './app'

const port = process.env.SAGE_PORT
console.log('Starting Sage Server...', port)
const server = Bun.serve({ port, fetch: app.fetch })
