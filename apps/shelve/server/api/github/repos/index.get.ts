import { z } from 'zod'
import { GithubService } from '~~/server/services/github'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { q } = await getValidatedQuery(event, z.object({
    q: z.string().optional(),
  }).parse)
  return await new GithubService().getUserRepos(user.id, q)
})
