// auth.d.ts
import { Role } from '@types'

declare module '#auth-utils' {

  interface User {
    id: number
    username: string
    email: string
    avatar: string
    authType: 'github' | 'google' | 'email'
    onboarding: boolean
    cliInstalled: boolean
    role: 'admin' | 'user'
    createdAt: Date
    updatedAt: Date
  }

  interface UserSession {
    user: User
    secure?: {
      githubToken?: string
      googleToken?: string
    }
    defaultTeamSlug?: string
    loggedInAt: Date
  }

  interface SecureSessionData {
    githubToken?: string
    googleToken?: string
  }

}

export {}
