import { z } from 'zod'
import { user as userTable } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireAppSession(event)
  const { teamSlug } = await readValidatedBody(event, z.object({
    teamSlug: z.string({
      error: 'Team Slug is required',
    }),
  }).parse)

  await db.update(userTable)
    .set({
      onboarding: true,
    })
    .where(eq(userTable.id, user.id))

  setCookie(event, 'defaultTeamSlug', teamSlug.toString())

  return {
    status: 200,
    body: {
      message: 'Onboarding completed successfully.',
    },
  }
})