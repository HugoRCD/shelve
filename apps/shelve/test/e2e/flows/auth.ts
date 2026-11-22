import { request } from 'node:http'
import { url, fetch } from '@nuxt/test-utils/e2e'
import { test, expect } from 'vitest'
import type { AuditLogResponse } from '@types'
import type { E2EContext } from '../helpers'
import { E2E_APP_URL, seedUser } from '../helpers'

/** POSTs an empty JSON body with the given headers, `Host` included, which `fetch` won't let us set. */
function postWithHeaders(path: string, headers: Record<string, string>): Promise<{ status: number; body: any }> {
  const { hostname, port } = new URL(url('/'))
  return new Promise((resolve, reject) => {
    const req = request({ hostname, port, path, method: 'POST', headers: { 'Content-Type': 'application/json', ...headers } }, (res) => {
      let data = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => resolve({ status: res.statusCode!, body: data ? JSON.parse(data) : undefined }))
    })
    req.on('error', reject)
    req.end('{}')
  })
}

export function registerAuthTests(ctx: E2EContext) {
  test('the CLI login link keeps the app URL whatever Host the request sends', async () => {
    const { status, body } = await postWithHeaders('/api/auth/device', { Host: 'evil.example' })
    expect(status).toBe(200)
    expect(body.verification_uri.startsWith(`${E2E_APP_URL}/cli/authorize?user_code=`)).toBe(true)
  })

  test('audit entries record the connection address, not an X-Forwarded-For the client sent', async () => {
    await ctx.api('/api/api-keys', {
      method: 'POST',
      body: { name: 'forged-forwarded-ip' },
      headers: { 'X-Forwarded-For': 'x'.repeat(60) },
    })
    await ctx.api('/api/api-keys', {
      method: 'POST',
      body: { name: 'forwarded-ip' },
      headers: { 'X-Forwarded-For': '203.0.113.7' },
    })

    const { logs } = await ctx.api<AuditLogResponse>(`/api/teams/${ctx.teamSlug}/audit-logs?action=token.create&limit=100`)
    const loopback = /^(127\.0\.0\.1|::1|::ffff:127\.0\.0\.1)$/
    expect(logs.find(entry => entry.metadata?.name === 'forged-forwarded-ip')?.ip).toMatch(loopback)
    expect(logs.find(entry => entry.metadata?.name === 'forwarded-ip')?.ip).toMatch(loopback)
  })

  test('deleting an account ends its session', async () => {
    const { cookie } = await seedUser({ username: 'e2e-leaver', email: 'e2e-leaver@shelve.cloud' })
    const sessionName = cookie.split('=')[0]!
    const response = await fetch(url('/api/user'), { method: 'DELETE', headers: { Cookie: cookie } })
    expect(response.ok).toBe(true)

    const sessionCookie = response.headers.getSetCookie().find(value => value.startsWith(`${sessionName}=`))
    expect(sessionCookie).toMatch(new RegExp(`^${sessionName}=;.*Max-Age=0`))
  })
}
