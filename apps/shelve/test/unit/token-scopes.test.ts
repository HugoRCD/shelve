import { describe, test, expect, vi, beforeEach } from 'vitest'
import type { H3Event } from 'h3'
import type { TokenScopes } from '@types'

// The real util calls Nuxt / h3 globals (`getUserSession`, `createError`).
// Stub them on the global so the module under test can import normally.
vi.stubGlobal('createError', (opts: { statusCode: number; statusMessage: string }) => {
  const err = new Error(opts.statusMessage) as Error & { statusCode: number }
  err.statusCode = opts.statusCode
  return err
})

let currentScopes: TokenScopes | null | undefined
vi.stubGlobal('getUserSession', () => {
  return Promise.resolve(currentScopes === undefined ? {} : { tokenScopes: currentScopes })
})
vi.stubGlobal('requireUserSession', () => Promise.resolve({ user: { id: 1 } }))
vi.stubGlobal('getValidatedRouterParams', () => Promise.resolve({ slug: 'team' }))

const { requireTokenScope } = await import('../../server/utils/auth')

const fakeEvent = {} as H3Event

function withScopes(scopes: TokenScopes | null | undefined) {
  currentScopes = scopes
}

beforeEach(() => {
  currentScopes = undefined
})

describe('requireTokenScope', () => {
  test('is a no-op when the session has no token scopes (web session)', async () => {
    withScopes(null)
    await expect(requireTokenScope(fakeEvent, { permission: 'write' })).resolves.toBeUndefined()
  })

  test('throws 403 when the required permission is missing', async () => {
    withScopes({ permissions: ['read'] })
    await expect(
      requireTokenScope(fakeEvent, { permission: 'write' })
    ).rejects.toMatchObject({ statusCode: 403, message: expect.stringContaining('write') })
  })

  test('passes when the required permission is granted', async () => {
    withScopes({ permissions: ['read', 'write'] })
    await expect(requireTokenScope(fakeEvent, { permission: 'write' })).resolves.toBeUndefined()
  })

  test('throws when teamIds is set and the resource team is out of scope', async () => {
    withScopes({ permissions: ['read'], teamIds: [1, 2] })
    await expect(
      requireTokenScope(fakeEvent, { permission: 'read', teamId: 99 })
    ).rejects.toMatchObject({ statusCode: 403, message: 'Token not authorized for this team' })
  })

  test('passes when teamIds is set and the resource team is in scope', async () => {
    withScopes({ permissions: ['read'], teamIds: [1, 2] })
    await expect(
      requireTokenScope(fakeEvent, { permission: 'read', teamId: 2 })
    ).resolves.toBeUndefined()
  })

  test('skips team check when teamIds is empty (unrestricted)', async () => {
    withScopes({ permissions: ['read'], teamIds: [] })
    await expect(
      requireTokenScope(fakeEvent, { permission: 'read', teamId: 42 })
    ).resolves.toBeUndefined()
  })

  test('enforces projectIds when set', async () => {
    withScopes({ permissions: ['read', 'write'], projectIds: [10] })
    await expect(
      requireTokenScope(fakeEvent, { permission: 'write', projectId: 11 })
    ).rejects.toMatchObject({ statusCode: 403, message: 'Token not authorized for this project' })

    await expect(
      requireTokenScope(fakeEvent, { permission: 'write', projectId: 10 })
    ).resolves.toBeUndefined()
  })

  test('enforces environmentIds when set', async () => {
    withScopes({ permissions: ['read'], environmentIds: [5] })
    await expect(
      requireTokenScope(fakeEvent, { permission: 'read', environmentId: 7 })
    ).rejects.toMatchObject({ statusCode: 403, message: 'Token not authorized for this environment' })

    await expect(
      requireTokenScope(fakeEvent, { permission: 'read', environmentId: 5 })
    ).resolves.toBeUndefined()
  })

  test('does not check resource ids that are omitted from the call', async () => {
    withScopes({ permissions: ['read'], teamIds: [1], projectIds: [10] })
    await expect(
      requireTokenScope(fakeEvent, { permission: 'read' })
    ).resolves.toBeUndefined()
  })
})
