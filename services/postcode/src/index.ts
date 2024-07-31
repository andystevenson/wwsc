import app from './app'

const apiKey = process.env.GETADDRESS_API_KEY
if (!apiKey) {
  console.error('GETADDRESS_API_KEY not set')
  process.exit(1)
}

const port = process.env.POSTCODE_PORT
if (!port) {
  console.error('POSTCODE_PORT not set')
  process.exit(1)
}
console.log('Starting Postcode Server...', port)
const server = Bun.serve({ port, fetch: app.fetch })
