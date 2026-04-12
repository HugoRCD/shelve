import { AuthType } from '@types'

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

  await setUserSession(event, {
    user,
    loggedInAt: new Date(),
  })

  return user
})
