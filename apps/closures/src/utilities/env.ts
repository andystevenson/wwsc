declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CLOSURES_PORT: string
      WHITELISTED_IPS: string
    }
  }
}

if (!process.env.CLOSURES_PORT) {
  throw new Error('CLOSURES_PORT environment variable is required')
}

if (!process.env.WHITELISTED_IPS) {
  throw new Error('WHITELISTED_IPS environment variable is required')
}

export default {
  CLOSURES_PORT: process.env.CLOSURES_PORT,
  WHITELISTED_IPS: process.env.WHITELISTED_IPS,
}
