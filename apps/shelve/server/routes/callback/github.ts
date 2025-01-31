import { z } from 'zod'
import { GithubService } from '~~/server/services/github'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { code } = await getValidatedQuery(event, z.object({
    code: z.string({ required_error: 'code is required' }),
  }).parse)
  const callback = await new GithubService(event).handleAppCallback(user.id, code)
  return sendRedirect(event, callback)
})
