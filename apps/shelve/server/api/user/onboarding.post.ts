import { z, zh } from 'h3-zod'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { teamId } = await zh.useValidatedBody(event, {
    teamId: z.number({
      required_error: 'Team ID is required',
    }),
  })

  const [updatedUser] = await useDrizzle().update(tables.users)
    .set({
      onboarding: true,
    })
    .where(eq(tables.users.id, user.id))
    .returning()

  await setUserSession(event, {
    user: updatedUser,
    loggedInAt: new Date().toISOString(),
  })

  setCookie(event, 'defaultTeamId', teamId.toString())

  return {
    status: 200,
    body: {
      message: 'Onboarding completed successfully.',
    },
  }
})
