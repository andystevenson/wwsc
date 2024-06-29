import app from './app'

const apiKey = process.env.GETADDRESS_API_KEY
if (!apiKey) {
  console.error('GETADDRESS_API_KEY not set')
  process.exit(1)
}

const port = process.env.PORT || 8765
console.log('Starting Postcode Server...', port)
const server = Bun.serve({ port, fetch: app.fetch })
