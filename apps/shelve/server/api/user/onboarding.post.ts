import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const { user } = await requireAppSession(event)
  const { teamSlug } = await readValidatedBody(event, z.object({
    teamSlug: z.string({
      error: 'Team Slug is required',
    }),
  }).parse)

  await db.update(schema.user)
    .set({
      onboarding: true,
    })
    .where(eq(schema.user.id, user.id))

  setCookie(event, 'defaultTeamSlug', teamSlug.toString())

  return {
    status: 200,
    body: {
      message: 'Onboarding completed successfully.',
    },
  }
})
