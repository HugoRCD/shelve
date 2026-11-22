import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

function createServerAuth() {
  return betterAuth({
    secret: useRuntimeConfig().appSecret,
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        users: schema.users,
        accounts: schema.accounts,
        sessions: schema.sessions,
        verifications: schema.verifications,
      },
    }),
    advanced: {
      // Shelve's tables use bigint identity columns. Better Auth reads their IDs back as strings.
      database: { generateId: 'serial' },
    },
    user: {
      modelName: 'users',
      fields: { name: 'username', image: 'avatar' },
      additionalFields: {
        role: { type: 'string', required: false, input: false },
        authType: { type: 'string', required: false, input: false },
        onboarding: { type: 'boolean', required: false, input: false },
        cliInstalled: { type: 'boolean', required: false, input: false },
      },
    },
    account: {
      modelName: 'accounts',
      fields: { providerId: 'provider', accountId: 'providerAccountId' },
    },
    session: { modelName: 'sessions' },
    verification: { modelName: 'verifications' },
  })
}

let instance: ReturnType<typeof createServerAuth> | undefined

/** The Better Auth instance, created on first use because it reads the runtime config. */
export function useServerAuth() {
  instance ??= createServerAuth()
  return instance
}
