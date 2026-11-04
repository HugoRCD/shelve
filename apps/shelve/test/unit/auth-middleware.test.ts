import { describe, test, expect, vi, beforeEach } from 'vitest'
import type { H3Event } from 'h3'

vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
vi.stubGlobal('createError', (opts: { statusCode: number; statusMessage: string }) => {
  const err = new Error(opts.statusMessage) as Error & { statusCode: number }
  err.statusCode = opts.statusCode
  return err
})

let session: Record<string, unknown> = {}
const clearUserSession = vi.fn()
const setUserSession = vi.fn()
const authenticateToken = vi.fn()
vi.stubGlobal('getUserSession', () => Promise.resolve(session))
vi.stubGlobal('clearUserSession', clearUserSession)
vi.stubGlobal('setUserSession', setUserSession)
vi.stubGlobal('authenticateToken', authenticateToken)
vi.stubGlobal('getRequestURL', (event: H3Event) => new URL(event.path, 'http://localhost'))
vi.stubGlobal('getRequestHeader', (event: H3Event & { headers: Record<string, string> }, name: string) => event.headers[name])
vi.stubGlobal('getCookie', () => undefined)
vi.stubGlobal('getRequestPermission', () => 'read')
vi.stubGlobal('requireTokenScope', () => Promise.resolve())
vi.stubGlobal('useRuntimeConfig', () => ({ session: { name: 'nuxt-auth-session' } }))

const { default: authMiddleware } = await import('../../server/middleware/2.auth')
const run = authMiddleware as unknown as (event: H3Event) => Promise<void>

function request(path: string, headers: Record<string, string> = {}, method = 'GET') {
  const responseHeaders = new Map<string, unknown>()
  const res = {
    getHeader: (name: string) => responseHeaders.get(name),
    setHeader: (name: string, value: unknown) => responseHeaders.set(name, value),
    removeHeader: (name: string) => responseHeaders.delete(name),
  }
  return { path, method, headers, node: { res } } as unknown as H3Event
}

beforeEach(() => {
  session = {}
  vi.clearAllMocks()
})

describe('auth middleware', () => {
  test('refuses a token session replayed from a cookie, even on /api/auth routes', async () => {
    session = { user: { id: 1 }, tokenScopes: { permissions: ['read'] }, tokenId: 7 }

    await expect(run(request('/api/auth/device/approve', {}, 'POST'))).rejects.toMatchObject({ statusCode: 401 })
    expect(clearUserSession).toHaveBeenCalledOnce()
  })

  test('lets web sessions through without looking at tokens', async () => {
    session = { user: { id: 1 } }

    await expect(run(request('/api/tokens', { authorization: 'Bearer she_x' }, 'POST'))).resolves.toBeUndefined()
    expect(authenticateToken).not.toHaveBeenCalled()
  })

  test('refuses tokens on account and token routes', async () => {
    for (const path of ['/api/tokens', '/api/user', '/api/user/scope-labels', '/api/admin/users']) {
      await expect(run(request(path, { authorization: 'Bearer she_x' }))).rejects.toMatchObject({ statusCode: 403 })
    }
    await expect(run(request('/api/teams', { authorization: 'Bearer she_x' }, 'POST'))).rejects.toMatchObject({ statusCode: 403 })
    await expect(run(request('/api/user/me', { authorization: 'Bearer she_x' }, 'PUT'))).rejects.toMatchObject({ statusCode: 403 })
    expect(authenticateToken).not.toHaveBeenCalled()
  })

  test('keeps token sessions out of the session cookie', async () => {
    authenticateToken.mockResolvedValue({
      user: { id: 1 },
      scopes: { permissions: ['read'] },
      token: { id: 7, prefix: 'she_', name: 'ci' },
    })

    // Like nuxt-auth-utils 0.6, seal the session into a cookie next to one set elsewhere.
    setUserSession.mockImplementation((event: H3Event) => {
      event.node.res.setHeader('set-cookie', ['other=1; Path=/', 'nuxt-auth-session=sealed; Path=/; HttpOnly'])
    })
    const event = request('/api/teams/acme/projects', { authorization: 'Bearer she_x' })

    await run(event)

    expect(setUserSession).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ tokenId: 7 }))
    expect(event.node.res.getHeader('set-cookie')).toEqual(['other=1; Path=/'])
  })
})
