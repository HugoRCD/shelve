// auth.d.ts
import type { Role } from '@shelve/types'

declare module '#auth-utils' {
  type User = {
    id: number
    email: string
    username: string
    avatar: string
    role: Role
    createdAt: Date
    updatedAt: Date
  }

  type UserSession = {
    user: User
    secure?: {
      githubToken?: string
      googleToken?: string
    }
    loggedInAt: string
  }
}

export {}
