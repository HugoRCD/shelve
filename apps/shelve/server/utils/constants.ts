export const API_KEY_PREFIX = 'she_'
export const DEFAULT_AVATAR = 'https://i.imgur.com/6VBx3io.png'
export const API_KEY_START_LENGTH = 12

/** `users` columns that can be sent to clients. */
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
