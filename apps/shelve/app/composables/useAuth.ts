import type { User } from '@types'

/**
 * The signed-in user, read from `/api/user/me`. Better Auth owns the session cookie; this keeps
 * Shelve's `User` shape (numeric ID, `username`, `avatar`) on the client.
 */
export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)
  const loggedIn = computed(() => !!user.value)
  // Only the latest fetch or sign-out writes `user`, so a refresh that resolves after a sign-out can't sign back in.
  const generation = useState('auth-generation', () => 0)

  async function fetch() {
    const current = ++generation.value
    try {
      const me = await $fetch<User>('/api/user/me')
      if (current === generation.value) user.value = me
    } catch (error) {
      // Only a rejected session signs out here: a network or server error keeps the current user.
      if (current === generation.value && (error as { statusCode?: number }).statusCode === 401) user.value = null
    }
  }

  async function clear() {
    generation.value++
    await $fetch('/api/auth/sign-out', { method: 'POST' }).catch(() => {})
    user.value = null
  }

  return { user, loggedIn, fetch, clear }
}
