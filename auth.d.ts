// auth.d.ts
import { AuthType, Role } from '@shelve/types'

declare module '#auth-utils' {
  // eslint-disable-next-line
  interface User {
    id: number
    username: string
    email: string
    avatar: string
    authType: AuthType
    onboarding: boolean
    cliInstalled: boolean
    role: Role
    createdAt: Date
    updatedAt: Date
  }

  // eslint-disable-next-line
  interface UserSession {
    user: User
    secure?: {
      githubToken?: string
      googleToken?: string
    }
    defaultTeamSlug?: string
    loggedInAt: string
  }

  // eslint-disable-next-line
  interface SecureSessionData {
    githubToken?: string
    googleToken?: string
  }

}

export {}
