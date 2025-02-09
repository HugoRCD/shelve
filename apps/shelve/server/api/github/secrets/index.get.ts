import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { repository } = await getValidatedQuery(event, z.object({
    repository: z.string({
      required_error: 'Repository is required',
    }).min(1).trim(),
  }).parse)
  return await new GithubService(event).getSecrets(user.id, repository)
})
