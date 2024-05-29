import app from './app'

const port = process.env.PORT || 7891
console.log('Starting Sage Server...', port)
const server = Bun.serve({ port, fetch: app.fetch })
