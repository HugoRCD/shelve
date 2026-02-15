import { z } from 'zod'
import { user as authUser } from '../../db/schema/better-auth.postgresql'

export default defineEventHandler(async (event) => {
  const { user } = await requireAppSession(event)
  const { teamSlug } = await readValidatedBody(event, z.object({
    teamSlug: z.string({
      error: 'Team Slug is required',
    }),
  }).parse)

  await db.update(authUser)
    .set({
      onboarding: true,
    })
    .where(eq(authUser.id, user.id))

  setCookie(event, 'defaultTeamSlug', teamSlug.toString())

  return {
    status: 200,
    body: {
      message: 'Onboarding completed successfully.',
    },
  }
})
