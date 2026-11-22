import { createHmac } from 'node:crypto'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'

vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
vi.stubGlobal('createError', (opts: { statusCode: number; statusMessage: string }) =>
  Object.assign(new Error(opts.statusMessage), opts))
vi.stubGlobal('readRawBody', (event: { body?: string }) => Promise.resolve(event.body))
vi.stubGlobal('getHeader', (event: { headers: Record<string, string> }, name: string) => event.headers[name])
let configuredSecret = ''
vi.stubGlobal('useRuntimeConfig', () => ({ private: { resendWebhookSecret: configuredSecret } }))

const { verifyResendSignature } = await import('../../server/utils/resend-webhook')
vi.stubGlobal('verifyResendSignature', verifyResendSignature)
const handler = (await import('../../server/api/webhooks/resend.post')).default as unknown as (event: unknown) => Promise<unknown>

// The example Svix publishes for its verification libraries.
const secret = 'whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw'
const id = 'msg_p5jXN8AQM9LWM0D4loKWxJek'
const timestamp = '1614265330'
const body = '{"test": 2432232314}'
const signature = 'v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE='

describe('verifyResendSignature', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(Number(timestamp) * 1000)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('accepts a correct signature', () => {
    expect(verifyResendSignature(secret, { id, timestamp, signature }, body)).toBe(true)
    // Any matching v1 signature is enough, as during a secret rotation.
    expect(verifyResendSignature(secret, { id, timestamp, signature: `v1,Zm9v v2,abc ${signature}` }, body)).toBe(true)
  })

  test('refuses a tampered body, id or timestamp', () => {
    expect(verifyResendSignature(secret, { id, timestamp, signature }, '{"test": 2432232315}')).toBe(false)
    expect(verifyResendSignature(secret, { id: 'msg_other', timestamp, signature }, body)).toBe(false)
    expect(verifyResendSignature(secret, { id, timestamp: String(Number(timestamp) + 1), signature }, body)).toBe(false)
  })

  test('refuses a timestamp more than 5 minutes from now', () => {
    vi.setSystemTime((Number(timestamp) + 5 * 60 + 1) * 1000)
    expect(verifyResendSignature(secret, { id, timestamp, signature }, body)).toBe(false)
    vi.setSystemTime((Number(timestamp) - 5 * 60 - 1) * 1000)
    expect(verifyResendSignature(secret, { id, timestamp, signature }, body)).toBe(false)
  })

  test('refuses malformed headers and secrets without throwing', () => {
    const malformed = ['', ' ', 'garbage', 'v1', 'v1,', ',', 'v1,not base64!', signature.slice(3), signature.replace('v1,', 'v2,'), `${signature}=`]
    for (const value of malformed) {
      expect(() => verifyResendSignature(secret, { id, timestamp, signature: value }, body)).not.toThrow()
      expect(verifyResendSignature(secret, { id, timestamp, signature: value }, body)).toBe(false)
    }
    expect(verifyResendSignature(secret, { timestamp, signature }, body)).toBe(false)
    expect(verifyResendSignature(secret, { id, signature }, body)).toBe(false)
    expect(verifyResendSignature(secret, { id, timestamp: 'soon', signature }, body)).toBe(false)
    for (const badSecret of ['', 'whsec_', 'whsec_%%%'])
      expect(verifyResendSignature(badSecret, { id, timestamp, signature }, body)).toBe(false)
  })
})

describe('POST /api/webhooks/resend', () => {
  const event = JSON.stringify({
    type: 'email.sent',
    created_at: '2026-11-22T00:00:00.000Z',
    data: { email_id: 'email_1', from: 'Shelve <hello@shelve.cloud>', to: ['someone@shelve.cloud'] },
  })

  function signed(payload: string, at = Math.floor(Date.now() / 1000)) {
    const key = Buffer.from(secret.slice('whsec_'.length), 'base64')
    const digest = createHmac('sha256', key).update(`${id}.${at}.${payload}`).digest('base64')
    return { 'svix-id': id, 'svix-timestamp': String(at), 'svix-signature': `v1,${digest}` }
  }

  beforeEach(() => {
    configuredSecret = secret
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  test('accepts an event Resend signed', async () => {
    await expect(handler({ headers: signed(event), body: event })).resolves.toEqual({ received: true })
  })

  test('refuses a tampered, unsigned or stale event', async () => {
    const tampered = event.replace('someone@', 'attacker@')
    await expect(handler({ headers: signed(event), body: tampered })).rejects.toMatchObject({ statusCode: 401 })
    await expect(handler({ headers: {}, body: event })).rejects.toMatchObject({ statusCode: 401 })
    await expect(handler({ headers: { ...signed(event), 'svix-signature': 'garbage' }, body: event })).rejects.toMatchObject({ statusCode: 401 })
    const stale = Math.floor(Date.now() / 1000) - 10 * 60
    await expect(handler({ headers: signed(event, stale), body: event })).rejects.toMatchObject({ statusCode: 401 })
  })

  test('refuses every event in production when no secret is configured', async () => {
    configuredSecret = ''
    vi.stubEnv('VERCEL_ENV', 'production')
    await expect(handler({ headers: {}, body: event })).rejects.toMatchObject({ statusCode: 503 })

    vi.stubEnv('VERCEL_ENV', '')
    vi.stubEnv('NODE_ENV', 'production')
    await expect(handler({ headers: {}, body: event })).rejects.toMatchObject({ statusCode: 503 })
  })

  test('accepts unsigned events in development when no secret is configured', async () => {
    configuredSecret = ''
    vi.stubEnv('VERCEL_ENV', '')
    vi.stubEnv('NODE_ENV', 'development')
    await expect(handler({ headers: {}, body: event })).resolves.toEqual({ received: true })
  })
})
