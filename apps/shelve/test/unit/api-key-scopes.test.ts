import { describe, test, expect, vi, beforeEach } from 'vitest'
import type { H3Event } from 'h3'
import type { ApiKeyScopes } from '@types'

// The real util calls Nuxt / h3 globals (`createError`).
// Stub them on the global so the module under test can import normally.
vi.stubGlobal('createError', (opts: { statusCode: number; statusMessage: string }) => {
  const err = new Error(opts.statusMessage) as Error & { statusCode: number }
  err.statusCode = opts.statusCode
  return err
})

vi.stubGlobal('getValidatedRouterParams', () => Promise.resolve({ slug: 'team' }))

const { requireApiKeyScope, getRequestPermission, getApiKeyScopeIds } = await import('../../server/utils/auth')

const fakeEvent = { context: {} } as H3Event

/** `null` is a web session; scopes make it an API key request, as the auth middleware does. */
function withScopes(scopes: ApiKeyScopes | null) {
  fakeEvent.context.auth = {
    user: { id: 1 } as never,
    apiKey: scopes ? { id: 7, start: 'she_', name: 'ci', scopes } : null,
  }
}

beforeEach(() => {
  withScopes(null)
})

describe('requireApiKeyScope', () => {
  test('is a no-op when the session has no token scopes (web session)', async () => {
    withScopes(null)
    await expect(requireApiKeyScope(fakeEvent, { permission: 'write' })).resolves.toBeUndefined()
  })

  test('throws 403 when the required permission is missing', async () => {
    withScopes({ permissions: ['read'] })
    await expect(
      requireApiKeyScope(fakeEvent, { permission: 'write' })
    ).rejects.toMatchObject({ statusCode: 403, message: expect.stringContaining('write') })
  })

  test('passes when the required permission is granted', async () => {
    withScopes({ permissions: ['read', 'write'] })
    await expect(requireApiKeyScope(fakeEvent, { permission: 'write' })).resolves.toBeUndefined()
  })

  test('throws when teamIds is set and the resource team is out of scope', async () => {
    withScopes({ permissions: ['read'], teamIds: [1, 2] })
    await expect(
      requireApiKeyScope(fakeEvent, { permission: 'read', teamId: 99 })
    ).rejects.toMatchObject({ statusCode: 403, message: 'Token not authorized for this team' })
  })

  test('passes when teamIds is set and the resource team is in scope', async () => {
    withScopes({ permissions: ['read'], teamIds: [1, 2] })
    await expect(
      requireApiKeyScope(fakeEvent, { permission: 'read', teamId: 2 })
    ).resolves.toBeUndefined()
  })

  test('skips team check when teamIds is empty (unrestricted)', async () => {
    withScopes({ permissions: ['read'], teamIds: [] })
    await expect(
      requireApiKeyScope(fakeEvent, { permission: 'read', teamId: 42 })
    ).resolves.toBeUndefined()
  })

  test('enforces projectIds when set', async () => {
    withScopes({ permissions: ['read', 'write'], projectIds: [10] })
    await expect(
      requireApiKeyScope(fakeEvent, { permission: 'write', projectId: 11 })
    ).rejects.toMatchObject({ statusCode: 403, message: 'Token not authorized for this project' })

    await expect(
      requireApiKeyScope(fakeEvent, { permission: 'write', projectId: 10 })
    ).resolves.toBeUndefined()
  })

  test('enforces environmentIds when set', async () => {
    withScopes({ permissions: ['read'], environmentIds: [5] })
    await expect(
      requireApiKeyScope(fakeEvent, { permission: 'read', environmentId: 7 })
    ).rejects.toMatchObject({ statusCode: 403, message: 'Token not authorized for this environment' })

    await expect(
      requireApiKeyScope(fakeEvent, { permission: 'read', environmentId: 5 })
    ).resolves.toBeUndefined()
  })

  test('does not check resource ids that are omitted from the call', async () => {
    withScopes({ permissions: ['read'], teamIds: [1], projectIds: [10] })
    await expect(
      requireApiKeyScope(fakeEvent, { permission: 'read' })
    ).resolves.toBeUndefined()
  })

  test('refuses project-restricted tokens on actions spanning every project', async () => {
    withScopes({ permissions: ['read', 'write'], projectIds: [10] })
    await expect(
      requireApiKeyScope(fakeEvent, { permission: 'write', teamId: 1, allProjects: true })
    ).rejects.toMatchObject({ statusCode: 403, message: 'Token is restricted to specific projects' })
  })

  test('refuses environment-restricted tokens on actions spanning every environment', async () => {
    withScopes({ permissions: ['read', 'write'], environmentIds: [5] })
    await expect(
      requireApiKeyScope(fakeEvent, { permission: 'write', projectId: 10, allEnvironments: true })
    ).rejects.toMatchObject({ statusCode: 403, message: 'Token is restricted to specific environments' })
  })

  test('lets team-restricted tokens act on the whole team', async () => {
    withScopes({ permissions: ['read', 'write'], teamIds: [1] })
    await expect(
      requireApiKeyScope(fakeEvent, { permission: 'write', teamId: 1, allProjects: true, allEnvironments: true })
    ).resolves.toBeUndefined()
  })
})

describe('getRequestPermission', () => {
  test('maps safe methods to read and everything else to write', () => {
    expect(getRequestPermission({ method: 'GET' } as H3Event)).toBe('read')
    expect(getRequestPermission({ method: 'HEAD' } as H3Event)).toBe('read')
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE'])
      expect(getRequestPermission({ method } as H3Event)).toBe('write')
  })
})

describe('getApiKeyScopeIds', () => {
  test('returns null for web sessions and unrestricted tokens', async () => {
    withScopes(null)
    await expect(getApiKeyScopeIds(fakeEvent, 'projectIds')).resolves.toBeNull()
    withScopes({ permissions: ['read'], projectIds: [] })
    await expect(getApiKeyScopeIds(fakeEvent, 'projectIds')).resolves.toBeNull()
  })

  test('returns the restricted ids', async () => {
    withScopes({ permissions: ['read'], environmentIds: [5, 6] })
    await expect(getApiKeyScopeIds(fakeEvent, 'environmentIds')).resolves.toEqual([5, 6])
  })
})
