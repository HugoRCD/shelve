import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { teamSlug } = await readValidatedBody(event, z.object({
    teamSlug: z.string({
      error: 'Team Slug is required',
    }),
  }).parse)

  const [updatedUser] = await db.update(schema.users)
    .set({
      onboarding: true,
    })
    .where(eq(schema.users.id, user.id))
    .returning()

  await setUserSession(event, {
    user: updatedUser,
    loggedInAt: new Date(),
  })

  setCookie(event, 'defaultTeamSlug', teamSlug.toString())

  return {
    status: 200,
    body: {
      message: 'Onboarding completed successfully.',
    },
  }
})
