// auth.d.ts
import { Role } from '@types'

declare module '#auth-utils' {
   
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

   
  interface UserSession {
    user: User
    secure?: {
      githubToken?: string
      googleToken?: string
    }
    defaultTeamSlug?: string
    loggedInAt: string
  }

   
  interface SecureSessionData {
    githubToken?: string
    googleToken?: string
  }

}

export {}
