import env from './utilities/env'
import app from './app'

const port = env.TIMESHEETS_PORT
console.log('Starting Timesheet Server...', port)
const server = Bun.serve({ port, fetch: app.fetch })
