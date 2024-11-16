// auth.d.ts
import type { User } from '@shelve/types'

declare module '#auth-utils' {
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
