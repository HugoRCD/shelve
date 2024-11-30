export const DEBUG = process.env.DEBUG === 'true'
export const DEFAULT_ENV_FILENAME = '.env'
export const API_ENDPOINTS = {
  projects: '/projects',
  variables: '/variables',
  environments: '/environments',
} as const
