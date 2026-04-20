import { url, fetch } from '@nuxt/test-utils/e2e'
import { test, expect } from 'vitest'
import type { E2EContext } from '../helpers'

type CreatedToken = {
  id: number
  name: string
  prefix: string
  token?: string
  scopes?: { permissions: string[]; teamIds?: number[]; projectIds?: number[]; environmentIds?: number[] }
  expiresAt?: string | null
  allowedCidrs?: string[]
}

type ListedToken = Omit<CreatedToken, 'token'>

export function registerTokenTests(ctx: E2EContext) {
  const scopedTokens: CreatedToken[] = []

  test('POST /api/tokens returns the plaintext value exactly once', async () => {
    const created = await ctx.api<CreatedToken>('/api/tokens', {
      method: 'POST',
      body: { name: 'plaintext-once' },
    })

    expect(created.token).toBeDefined()
    expect(created.token!).toMatch(/^she_[0-9A-Z]+$/)
    expect(created.token).not.toContain('undefined')
    expect(created.prefix.startsWith('she_')).toBe(true)
  })

  test('GET /api/tokens never exposes the plaintext value', async () => {
    const list = await ctx.api<ListedToken[]>('/api/tokens')
    expect(list.length).toBeGreaterThan(0)
    for (const row of list) {
      expect((row as CreatedToken).token).toBeUndefined()
      expect(row.prefix).toBeDefined()
    }
  })

  test('tokens carry a default scope with both read and write permissions', async () => {
    const list = await ctx.api<ListedToken[]>('/api/tokens')
    const row = list.find((t) => t.name === 'plaintext-once')
    expect(row?.scopes?.permissions).toEqual(expect.arrayContaining(['read', 'write']))
  })

  test('creating a scoped token persists the scopes', async () => {
    const created = await ctx.api<CreatedToken>('/api/tokens', {
      method: 'POST',
      body: {
        name: 'read-only-team',
        scopes: { permissions: ['read'], teamIds: [] },
      },
    })
    expect(created.scopes?.permissions).toEqual(['read'])
    scopedTokens.push(created)
  })

  test('Bearer auth authorizes a CLI-style request', async () => {
    const token = scopedTokens[0]!.token!
    const res = await fetch(url('/api/teams'), {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.ok).toBe(true)
    const teams = await res.json()
    expect(Array.isArray(teams)).toBe(true)
  })

  test('legacy cookie auth still works but surfaces deprecation headers', async () => {
    const token = scopedTokens[0]!.token!
    const res = await fetch(url('/api/teams'), {
      headers: { Cookie: `authToken=${token}` },
    })
    expect(res.ok).toBe(true)
    expect(res.headers.get('Deprecation')).toBe('true')
    expect(res.headers.get('Sunset')).toBeTruthy()
  })

  test('a read-only token is rejected when trying to write variables', async () => {
    const token = scopedTokens[0]!.token!
    const res = await fetch(
      url(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variables`),
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variables: [{ key: 'SCOPED_DENIED', value: 'nope' }],
          environmentIds: ctx.environmentIds,
        }),
      }
    )
    expect(res.status).toBe(403)
  })

  test('a read-only token can read variables for the same resource', async () => {
    const token = scopedTokens[0]!.token!
    const res = await fetch(
      url(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variables/env/${ctx.environmentIds[0]}`),
      { headers: { Authorization: `Bearer ${token}` } }
    )
    expect(res.ok).toBe(true)
  })

  test('expired tokens are refused', async () => {
    const created = await ctx.api<CreatedToken>('/api/tokens', {
      method: 'POST',
      body: { name: 'expired', expiresIn: 1 },
    })
    // expiresIn is in seconds — wait long enough to pass the server-side check.
    await new Promise((r) => setTimeout(r, 1200))
    const res = await fetch(url('/api/teams'), {
      headers: { Authorization: `Bearer ${created.token}` },
    })
    expect(res.status).toBe(401)
  })

  test('invalid tokens produce a 401 (without leaking whether the token exists)', async () => {
    const res = await fetch(url('/api/teams'), {
      headers: { Authorization: 'Bearer she_definitely_not_a_real_token' },
    })
    expect(res.status).toBe(401)
  })

  test('DELETE /api/tokens/:id revokes the token', async () => {
    const created = await ctx.api<CreatedToken>('/api/tokens', {
      method: 'POST',
      body: { name: 'delete-me' },
    })
    await ctx.api(`/api/tokens/${created.id}`, { method: 'DELETE' })

    const res = await fetch(url('/api/teams'), {
      headers: { Authorization: `Bearer ${created.token}` },
    })
    expect(res.status).toBe(401)
  })
}
