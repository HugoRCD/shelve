import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const { user } = await requireUserSession(event)
  return await new GithubService(event).getUserApps(user.id)
})
