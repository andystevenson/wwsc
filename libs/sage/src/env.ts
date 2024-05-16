import 'dotenv/config'

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SAGE_API: string
      SAGE_CLIENT_ID: string
      SAGE_CLIENT_SECRET: string
      SAGE_GRANT_TYPE: string
      SAGE_REDIRECT_URI: string
      SAGE_ACCESS_TOKEN_URL: string
    }
  }
}

export const api = process.env.SAGE_API
export const client_id = process.env.SAGE_CLIENT_ID
export const client_secret = process.env.SAGE_CLIENT_SECRET
export const grant_type = process.env.SAGE_GRANT_TYPE
export const redirect_uri = process.env.SAGE_REDIRECT_URI
export const accessTokenUrl = process.env.SAGE_ACCESS_TOKEN_URL
export const revokeTokenUrl = process.env.SAGE_REVOKE_TOKEN_URL

if (!api) throw new Error('SAGE_API is not defined!')
if (!client_id) throw new Error('SAGE_CLIENT_ID is not defined!')
if (!client_secret) throw new Error('SAGE_CLIENT_SECRET is not defined!')
if (!grant_type) throw new Error('SAGE_GRANT_TYPE is not defined!')
if (!redirect_uri) throw new Error('SAGE_REDIRECT_URI is not defined!')
if (!accessTokenUrl) throw new Error('SAGE_ACCESS_TOKEN_URL is not defined!')
if (!revokeTokenUrl) throw new Error('SAGE_REVOKE_TOKEN_URL is not defined!')
