import { randomBytes } from 'node:crypto'
import { describe, test, expect, vi, afterEach } from 'vitest'
import { envSchema } from '../../modules/auth/index'

const appSecret = randomBytes(48).toString('base64')
const encryptionKey = randomBytes(48).toString('base64')

function failingFields(env: Record<string, string | undefined>): string[] {
  const result = envSchema.safeParse({ NUXT_APP_SECRET: appSecret, NUXT_PRIVATE_ENCRYPTION_KEY: encryptionKey, ...env })
  return [...new Set(result.error?.issues.map(issue => issue.path.join('.')))]
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('envSchema secrets', () => {
  test('accepts generated secrets', () => {
    expect(failingFields({})).toEqual([])
  })

  test('rejects the example values from the docs', () => {
    expect(failingFields({ NUXT_APP_SECRET: 'your-32-character-minimum-app-secret' })).toEqual(['NUXT_APP_SECRET'])
    expect(failingFields({ NUXT_PRIVATE_ENCRYPTION_KEY: 'your_32_character_minimum_encryption_key' })).toEqual(['NUXT_PRIVATE_ENCRYPTION_KEY'])
    expect(failingFields({ NUXT_APP_SECRET: '<output of: openssl rand -base64 48>' })).toEqual(['NUXT_APP_SECRET'])

    const result = envSchema.safeParse({ NUXT_APP_SECRET: 'your-32-character-minimum-app-secret', NUXT_PRIVATE_ENCRYPTION_KEY: encryptionKey })
    expect(result.error?.issues[0]?.message).toContain('openssl rand -base64 48')
  })

  test('accepts the .env.test values only while tests run', () => {
    const testValues = {
      NUXT_APP_SECRET: 'test-app-secret-at-least-32-chars-long',
      NUXT_PRIVATE_ENCRYPTION_KEY: 'test-encryption-key-at-least-32-chars',
    }
    expect(failingFields(testValues)).toEqual([])

    vi.stubEnv('VITEST', '')
    expect(failingFields(testValues)).toEqual(['NUXT_APP_SECRET', 'NUXT_PRIVATE_ENCRYPTION_KEY'])
  })
})

describe('envSchema app URL', () => {
  test('accepts an http(s) origin, or nothing', () => {
    expect(failingFields({ NUXT_PUBLIC_APP_URL: 'https://shelve.example.com' })).toEqual([])
    expect(failingFields({ NUXT_PUBLIC_APP_URL: 'https://shelve.example.com/' })).toEqual([])
    expect(failingFields({ NUXT_PUBLIC_APP_URL: 'http://localhost:3000' })).toEqual([])
    expect(failingFields({ NUXT_PUBLIC_APP_URL: '' })).toEqual([])
    expect(failingFields({ NUXT_PUBLIC_APP_URL: undefined })).toEqual([])
  })

  test('rejects anything that is not an http(s) origin', () => {
    for (const value of ['https://shelve.example.com/app', 'https://shelve.example.com?x=1', 'ftp://shelve.example.com', 'shelve.example.com'])
      expect(failingFields({ NUXT_PUBLIC_APP_URL: value }), value).toEqual(['NUXT_PUBLIC_APP_URL'])
  })
})
