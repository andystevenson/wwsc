import app from './app'

const port = process.env.PORT || 8765
console.log('Starting Postcode Server...', port)
const server = Bun.serve({ port, fetch: app.fetch })
