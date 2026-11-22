import { createHmac } from 'node:crypto'
import { AuthType } from '@types'

/** Test-only: creates a user and signs them in with a Better Auth session, without an email or OAuth round trip. */
export default defineEventHandler(async (event) => {
  if (!process.env.NUXT_TEST_SEED) {
    throw createError({ statusCode: 404 })
  }

  const body = await readBody(event)

  const [user] = await db.insert(schema.users).values({
    username: body.username || 'test-user',
    email: body.email || 'test@shelve.cloud',
    authType: AuthType.EMAIL,
  }).onConflictDoUpdate({
    target: [schema.users.email],
    set: { username: body.username || 'test-user' },
  }).returning()

  const ctx = await useServerAuth().$context
  const session = await ctx.internalAdapter.createSession(String(user!.id))
  // Signed like Better Auth's own `setSignedCookie`: `<token>.<base64 HMAC-SHA256>`.
  const signature = createHmac('sha256', ctx.secret).update(session.token).digest('base64')
  const { name, attributes } = ctx.authCookies.sessionToken
  setCookie(event, name, `${session.token}.${signature}`, {
    path: attributes.path,
    httpOnly: attributes.httpOnly,
    secure: attributes.secure,
    maxAge: attributes.maxAge,
    sameSite: attributes.sameSite?.toLowerCase() as 'lax' | 'strict' | 'none' | undefined,
  })

  return user
})
