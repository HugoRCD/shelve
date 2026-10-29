export const TOKEN_PREFIX = 'she_'
export const TOKEN_PREFIX_DISPLAY_LENGTH = 12

/** `users` columns that can be sent to clients. Leaves out the pending one-time login code and link token. */
export const PUBLIC_USER_COLUMNS = {
  id: true,
  username: true,
  email: true,
  avatar: true,
  role: true,
  authType: true,
  onboarding: true,
  cliInstalled: true,
  createdAt: true,
  updatedAt: true,
} as const
