declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string
      SAGE_CLIENT_ID: string
      SAGE_CLIENT_SECRET: string
      SAGE_SCOPE: string
      SAGE_STATE_SECRET: string
      SAGE_AUTH_URL: string
      SAGE_API_VERSION: string
      SAGE_ACCESS_TOKEN_URL: string
      SAGE_REVOKE_TOKEN_URL: string
      SAGE_RESPONSE_TYPE: string
      SAGE_REDIRECT_URI: string
      SAGE_COUNTRY: string
      SAGE_GRANT_TYPE: string
      SAGE_API: string
    }
  }
}

if (!process.env.PORT) {
  throw new Error('PORT environment variable is required')
}

if (!process.env.SAGE_CLIENT_ID) {
  throw new Error('SAGE_CLIENT_ID environment variable is required')
}

if (!process.env.SAGE_CLIENT_SECRET) {
  throw new Error('SAGE_CLIENT_SECRET environment variable is required')
}

if (!process.env.SAGE_SCOPE) {
  throw new Error('SAGE_SCOPE environment variable is required')
}

if (!process.env.SAGE_STATE_SECRET) {
  throw new Error('SAGE_STATE_SECRET environment variable is required')
}

if (!process.env.SAGE_AUTH_URL) {
  throw new Error('SAGE_AUTH_URL environment variable is required')
}

if (!process.env.SAGE_API_VERSION) {
  throw new Error('SAGE_API_VERSION environment variable is required')
}

if (!process.env.SAGE_ACCESS_TOKEN_URL) {
  throw new Error('SAGE_ACCESS_TOKEN_URL environment variable is required')
}

if (!process.env.SAGE_REVOKE_TOKEN_URL) {
  throw new Error('SAGE_REVOKE_TOKEN_URL environment variable is required')
}

if (!process.env.SAGE_RESPONSE_TYPE) {
  throw new Error('SAGE_RESPONSE_TYPE environment variable is required')
}

if (!process.env.SAGE_REDIRECT_URI) {
  throw new Error('SAGE_REDIRECT_URI environment variable is required')
}

if (!process.env.SAGE_COUNTRY) {
  throw new Error('SAGE_COUNTRY environment variable is required')
}

if (!process.env.SAGE_GRANT_TYPE) {
  throw new Error('SAGE_GRANT_TYPE environment variable is required')
}

if (!process.env.SAGE_API) {
  throw new Error('SAGE_API environment variable is required')
}

export default {
  PORT: process.env.PORT,
  SAGE_CLIENT_ID: process.env.SAGE_CLIENT_ID,
  SAGE_CLIENT_SECRET: process.env.SAGE_CLIENT_SECRET,
  SAGE_SCOPE: process.env.SAGE_SCOPE,
  SAGE_STATE_SECRET: process.env.SAGE_STATE_SECRET,
  SAGE_AUTH_URL: process.env.SAGE_AUTH_URL,
  SAGE_API_VERSION: process.env.SAGE_API_VERSION,
  SAGE_ACCESS_TOKEN_URL: process.env.SAGE_ACCESS_TOKEN_URL,
  SAGE_REVOKE_TOKEN_URL: process.env.SAGE_REVOKE_TOKEN_URL,
  SAGE_RESPONSE_TYPE: process.env.SAGE_RESPONSE_TYPE,
  SAGE_REDIRECT_URI: process.env.SAGE_REDIRECT_URI,
  SAGE_COUNTRY: process.env.SAGE_COUNTRY,
  SAGE_GRANT_TYPE: process.env.SAGE_GRANT_TYPE,
  SAGE_API: process.env.SAGE_API,
}
