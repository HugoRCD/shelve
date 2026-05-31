/**
 * Parses `?redirect=` targets for the Shelve CLI device login flow.
 */
export function isCliAuthorizeRedirect(redirect: string | null | undefined): boolean {
  if (!redirect) return false
  const path = redirect.split('?')[0] ?? ''
  return path === '/cli/authorize' || path.startsWith('/cli/authorize?')
}

export function parseCliAuthorizeRedirect(redirect: string | null | undefined): {
  isCliAuthorize: boolean
  userCode: string | null
} {
  if (!isCliAuthorizeRedirect(redirect)) {
    return { isCliAuthorize: false, userCode: null }
  }

  try {
    const query = redirect!.includes('?') ? redirect!.slice(redirect!.indexOf('?')) : ''
    const params = new URLSearchParams(query)
    const raw = params.get('user_code')?.trim().toUpperCase().replace(/\s+/g, '') ?? null
    return { isCliAuthorize: true, userCode: raw || null }
  } catch {
    return { isCliAuthorize: true, userCode: null }
  }
}
