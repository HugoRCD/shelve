import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { useDrizzle } from './server/utils/drizzle'

const db = useDrizzle()

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  user: {
    modelName: 'users',
    additionalFields: {
      onboarding: {
        type: 'boolean',
        required: true,
        defaultValue: 'false',
        input: false,
      },
      cliInstalled: {
        type: 'boolean',
        required: true,
        defaultValue: 'false',
        input: false,
      },
      username: {
        type: 'string',
        required: true,
        input: true,
      },
      authType: {
        type: 'string',
        required: true,
        input: false,
      },
      avatar: {
        type: 'string',
        required: true,
        input: true
      }
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      mapProfileToUser: (profile) => {
        return {
          username: profile.login,
          avatar: profile.avatar_url,
          authType: 'github',
        }
      },
    },
  },
})
