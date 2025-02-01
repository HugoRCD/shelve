// auth.d.ts
import { Role } from '@types'

declare module '#auth-utils' {
  // eslint-disable-next-line
  interface User {
    id: number
    username: string
    email: string
    avatar: string
    authType: 'github' | 'google'
    onboarding: boolean
    cliInstalled: boolean
    role: 'admin' | 'user'
    createdAt: string
    updatedAt: string
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
