// auth.d.ts
import type { Role } from '@shelve/types'

declare module '#auth-utils' {
  type User = {
    id: number
    email: string
    username: string
    avatar: string
    role: Role
    createdAt?: string
    updatedAt?: string
  }

  type UserSession = {
    user: User
    secure?: {
      githubToken?: string
    }
    loggedInAt: string
  }
}

export {}
