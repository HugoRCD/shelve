import { describe, test, expect, vi, beforeEach } from 'vitest'
import type { H3Event } from 'h3'

vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
vi.stubGlobal('createError', (opts: { statusCode: number; statusMessage: string }) => {
  const err = new Error(opts.statusMessage) as Error & { statusCode: number }
  err.statusCode = opts.statusCode
  return err
})

let session: { user: { id: number }; apiKey: null } | null = null
const authenticateApiKey = vi.fn()
vi.stubGlobal('getAuth', () => Promise.resolve(session))
vi.stubGlobal('authenticateApiKey', authenticateApiKey)
vi.stubGlobal('getRequestURL', (event: H3Event) => new URL(event.path, 'http://localhost'))
vi.stubGlobal('getRequestHeader', (event: H3Event & { headers: Record<string, string> }, name: string) => event.headers[name])
vi.stubGlobal('getCookie', () => undefined)
vi.stubGlobal('getRequestPermission', () => 'read')
vi.stubGlobal('requireApiKeyScope', () => Promise.resolve())

const { default: authMiddleware } = await import('../../server/middleware/2.auth')
const run = authMiddleware as unknown as (event: H3Event) => Promise<void>

function request(path: string, headers: Record<string, string> = {}, method = 'GET') {
  const responseHeaders = new Map<string, unknown>()
  const res = {
    getHeader: (name: string) => responseHeaders.get(name),
    setHeader: (name: string, value: unknown) => responseHeaders.set(name, value),
    removeHeader: (name: string) => responseHeaders.delete(name),
  }
  return { path, method, headers, context: {}, node: { res } } as unknown as H3Event
}

beforeEach(() => {
  session = null
  vi.clearAllMocks()
})

describe('auth middleware', () => {
  test('lets web sessions through without looking at API keys', async () => {
    session = { user: { id: 1 }, apiKey: null }

    await expect(run(request('/api/api-keys', { authorization: 'Bearer she_x' }, 'POST'))).resolves.toBeUndefined()
    expect(authenticateApiKey).not.toHaveBeenCalled()
  })

  test('refuses API keys on account and API key routes', async () => {
    for (const path of ['/api/api-keys', '/api/user', '/api/user/scope-labels', '/api/admin/users']) {
      await expect(run(request(path, { authorization: 'Bearer she_x' }))).rejects.toMatchObject({ statusCode: 403 })
    }
    await expect(run(request('/api/teams', { authorization: 'Bearer she_x' }, 'POST'))).rejects.toMatchObject({ statusCode: 403 })
    await expect(run(request('/api/user/me', { authorization: 'Bearer she_x' }, 'PUT'))).rejects.toMatchObject({ statusCode: 403 })
    expect(authenticateApiKey).not.toHaveBeenCalled()
  })

  test('keeps API key auth on the request, out of the session cookie', async () => {
    authenticateApiKey.mockResolvedValue({
      user: { id: 1 },
      apiKey: { id: 7, start: 'she_', name: 'ci', scopes: { permissions: ['read'] } },
    })
    const event = request('/api/teams/acme/projects', { authorization: 'Bearer she_x' })

    await run(event)

    expect(event.context.auth).toEqual({
      user: { id: 1 },
      apiKey: { id: 7, start: 'she_', name: 'ci', scopes: { permissions: ['read'] } },
    })
    expect(event.node.res.getHeader('set-cookie')).toBeUndefined()
  })
})
