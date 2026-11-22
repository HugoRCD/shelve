import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)
  const { teamSlug } = await readValidatedBody(event, z.object({
    teamSlug: z.string({
      error: 'Team Slug is required',
    }),
  }).parse)

  await db.update(schema.users)
    .set({
      onboarding: true,
    })
    .where(eq(schema.users.id, user.id))

  setCookie(event, 'defaultTeamSlug', teamSlug.toString())

  return {
    status: 200,
    body: {
      message: 'Onboarding completed successfully.',
    },
  }
})
