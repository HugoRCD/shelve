import { describe, test, expect, vi, afterEach } from 'vitest'
import type { H3Event } from 'h3'

let appUrl = ''
vi.stubGlobal('useRuntimeConfig', () => ({ public: { appUrl } }))
// Like h3, the request URL is built from the Host header the client sent.
vi.stubGlobal('getRequestURL', (event: { headers: { host: string } }) => new URL(`http://${event.headers.host}/api/auth/otp/send`))
vi.stubGlobal('createError', (opts: { statusCode: number; statusMessage: string }) => Object.assign(new Error(opts.statusMessage), opts))

const { getAppOrigin } = await import('../../server/utils/app-origin')

const spoofedEvent = { headers: { host: 'evil.example' } } as unknown as H3Event

afterEach(() => {
  appUrl = ''
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('getAppOrigin', () => {
  test('uses the configured URL whatever Host the request sends', () => {
    appUrl = 'https://shelve.example.com/'
    vi.stubEnv('VERCEL', '1')
    expect(getAppOrigin(spoofedEvent)).toBe('https://shelve.example.com')
  })

  test('refuses to build a link outside Vercel when no URL is configured', () => {
    vi.stubEnv('VERCEL', '')
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => getAppOrigin(spoofedEvent)).toThrow(expect.objectContaining({
      statusCode: 500,
      message: expect.stringContaining('NUXT_PUBLIC_APP_URL'),
    }))
  })

  test('uses the request origin on Vercel when no URL is configured', () => {
    vi.stubEnv('VERCEL', '1')
    expect(getAppOrigin(spoofedEvent)).toBe('http://evil.example')
  })
})
