import { createAuthClient } from 'better-auth/vue'

export function useAuth() {
  return createAuthClient({
    baseURL: 'http://localhost:3000',
  })
}
