import type { User } from '@types'

/**
 * The signed-in user, read from `/api/user/me`. Better Auth owns the session cookie; this keeps
 * Shelve's `User` shape (numeric ID, `username`, `avatar`) on the client.
 */
export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)
  const loggedIn = computed(() => !!user.value)

  async function fetch() {
    user.value = await $fetch<User>('/api/user/me').catch(() => null)
  }

  async function clear() {
    await $fetch('/api/auth/sign-out', { method: 'POST' }).catch(() => {})
    user.value = null
  }

  return { user, loggedIn, fetch, clear }
}
