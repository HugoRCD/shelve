import { fetch, url } from '@nuxt/test-utils/e2e'

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
