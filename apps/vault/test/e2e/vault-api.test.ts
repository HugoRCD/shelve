import { describe, test, expect } from 'vitest'
import { $fetch, fetch, setup } from '@nuxt/test-utils/e2e'

describe('Vault API', async () => {
  await setup({
    env: { NUXT_PRIVATE_ENCRYPTION_KEY: 'vault-e2e-encryption-key-only-for-tests' },
  })

  test('encrypt then decrypt a secret', async () => {
    const shareUrl = await $fetch('/api/vault', {
      method: 'POST',
      body: { value: 'my-secret-value', reads: 3, ttl: '1d' },
    })

    expect(shareUrl).toContain('?id=')
    const id = new URL(shareUrl).searchParams.get('id')
    expect(id).toMatch(/^[\w-]{22}$/)

    const result = await $fetch(`/api/vault?id=${id}`, {
      method: 'POST',
    })

    expect(result.decryptedValue).toBe('my-secret-value')
    expect(result.reads).toBe(2)
    expect(result.ttl).toBeDefined()
  })

  test('encrypt then decrypt with password', async () => {
    const shareUrl = await $fetch('/api/vault', {
      method: 'POST',
      body: { value: 'password-protected', reads: 5, ttl: '7d', password: 'my-password' },
    })

    const id = new URL(shareUrl).searchParams.get('id')

    const error = await $fetch(`/api/vault?id=${id}`, {
      method: 'POST',
    }).catch((e: any) => e)
    expect(error.statusCode).toBe(400)
    expect(error.statusMessage).toBe('Password required')

    const wrongPassword = await $fetch(`/api/vault?id=${id}`, {
      method: 'POST',
      body: { password: 'wrong' },
    }).catch((e: any) => e)
    expect(wrongPassword.statusCode).toBe(400)
    expect(wrongPassword.statusMessage).toBe('Invalid password')

    const result = await $fetch(`/api/vault?id=${id}`, {
      method: 'POST',
      body: { password: 'my-password' },
    })
    expect(result.decryptedValue).toBe('password-protected')
    expect(result.reads).toBe(4)
  })

  test('reads exhausted deletes the secret', async () => {
    const shareUrl = await $fetch('/api/vault', {
      method: 'POST',
      body: { value: 'one-time-secret', reads: 1, ttl: '1d' },
    })

    const id = new URL(shareUrl).searchParams.get('id')

    const result = await $fetch(`/api/vault?id=${id}`, {
      method: 'POST',
    })
    expect(result.decryptedValue).toBe('one-time-secret')
    expect(result.reads).toBe(0)

    const error = await $fetch(`/api/vault?id=${id}`, {
      method: 'POST',
    }).catch((e: any) => e)
    expect(error.statusCode).toBe(400)
  })

  test('deletes the secret after 5 wrong passwords', async () => {
    const shareUrl = await $fetch('/api/vault', {
      method: 'POST',
      body: { value: 'guarded', reads: 5, ttl: '1d', password: 'right' },
    })
    const id = new URL(shareUrl).searchParams.get('id')
    const tryPassword = (password: string) => $fetch(`/api/vault?id=${id}`, {
      method: 'POST',
      body: { password },
    }).catch((e: any) => e)

    for (let attempt = 1; attempt < 5; attempt++) {
      expect((await tryPassword('wrong')).statusMessage).toBe('Invalid password')
    }
    expect((await tryPassword('wrong')).statusMessage).toBe('Too many invalid password attempts, the secret has been deleted')
    expect((await tryPassword('right')).statusMessage).toBe('Invalid id or link has expired')
  })

  test('rejects an invalid encrypt body with 400', async () => {
    const error = await $fetch('/api/vault', {
      method: 'POST',
      body: { value: 'secret', reads: 0, ttl: '2d' },
    }).catch((e: any) => e)

    expect(error.statusCode).toBe(400)
  })

  test('invalid id returns 400', async () => {
    const error = await $fetch('/api/vault?id=nonexistent', {
      method: 'POST',
    }).catch((e: any) => e)

    expect(error.statusCode).toBe(400)
    expect(error.statusMessage).toBe('Invalid id or link has expired')
  })

  test('malformed id returns 400', async () => {
    const error = await $fetch('/api/vault?id=a:b', {
      method: 'POST',
    }).catch((e: any) => e)

    expect(error.statusCode).toBe(400)
    expect(error.statusMessage).toBe('Invalid id or link has expired')
  })

  test('pages cannot be framed', async () => {
    const response = await fetch('/')
    expect(response.headers.get('content-security-policy')).toBe('frame-ancestors \'none\'')
    expect(response.headers.get('x-frame-options')).toBe('DENY')
  })

  test('encrypt with infinite TTL', async () => {
    const shareUrl = await $fetch('/api/vault', {
      method: 'POST',
      body: { value: 'infinite-secret', reads: 10, ttl: 'Infinite' },
    })

    const id = new URL(shareUrl).searchParams.get('id')

    const result = await $fetch(`/api/vault?id=${id}`, {
      method: 'POST',
    })
    expect(result.decryptedValue).toBe('infinite-secret')
    expect(result.ttl).toBe('Infinite')
    expect(result.reads).toBe(9)
  })

  test('multiple reads decrement correctly', async () => {
    const shareUrl = await $fetch('/api/vault', {
      method: 'POST',
      body: { value: 'multi-read', reads: 3, ttl: '1d' },
    })

    const id = new URL(shareUrl).searchParams.get('id')

    const r1 = await $fetch(`/api/vault?id=${id}`, { method: 'POST' })
    expect(r1.reads).toBe(2)

    const r2 = await $fetch(`/api/vault?id=${id}`, { method: 'POST' })
    expect(r2.reads).toBe(1)

    const r3 = await $fetch(`/api/vault?id=${id}`, { method: 'POST' })
    expect(r3.reads).toBe(0)

    const error = await $fetch(`/api/vault?id=${id}`, { method: 'POST' }).catch((e: any) => e)
    expect(error.statusCode).toBe(400)
  })
})
