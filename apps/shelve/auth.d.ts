// auth.d.ts
declare module '#auth-utils' {
  type User = {
    id: string
    email: string
    username: string
    avatar: string
    role: string
  }

  type UserSession = {
    user: User
    secure: {
      githubToken?: string
    }
    loggedInAt: string
  }
}

export {}
