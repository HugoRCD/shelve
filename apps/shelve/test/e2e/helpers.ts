import { fetch, url } from '@nuxt/test-utils/e2e'

export interface E2EContext {
  api: ReturnType<typeof authedFetch>
  sessionCookie: string
  teamSlug: string
  projectId: number
  environmentIds: number[]
  variableId: number
  groupId: number
  cliToken: string
  cliTmpDir: string | undefined
}

export async function seedUser(data?: { username?: string; email?: string }) {
  const response = await fetch(url('/api/_test/seed'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data || {}),
  })

  if (!response.ok) {
    throw new Error(`Seed failed: ${response.status} ${await response.text()}`)
  }

  const setCookie = response.headers.getSetCookie()
  const cookie = setCookie.join('; ')
  const user = await response.json()

  return { user, cookie }
}

/**
 * Creates an API token usable by the CLI (`Cookie: authToken=…`) after a browser session exists.
 */
export async function getCliAuthToken(cookie: string): Promise<string> {
  const api = authedFetch(cookie)
  const created = await api<{ token?: string }>('/api/tokens', {
    method: 'POST',
    body: { name: 'e2e-cli' },
  })
  if (!created?.token || typeof created.token !== 'string')
    throw new Error('Failed to obtain CLI auth token (POST /api/tokens did not return a token)')

  return created.token
}

export function authedFetch(cookie: string) {
  return async <T = any>(path: string, options: { method?: string; body?: Record<string, unknown>; headers?: Record<string, string> } = {}): Promise<T> => {
    const response = await fetch(url(path), {
      method: options.method,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
      const error: any = new Error(`${response.status} ${response.statusText}`)
      error.statusCode = response.status
      error.statusMessage = response.statusText
      try {
        error.data = await response.json()
      } catch { /* response body not JSON */ }
      throw error
    }

    return response.json() as Promise<T>
  }
}
