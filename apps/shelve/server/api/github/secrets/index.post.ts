import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const { user } = await requireAppSession(event)
  const { variables, repository } = await readValidatedBody(event, z.object({
    variables: z.array(z.object({
      key: z.string({
        error: 'Variable key is required',
      }).min(1).trim(),
      value: z.string({
        error: 'Variable value is required',
      }).min(1).trim(),
    })).min(1).max(100),
    repository: z.string({
      error: 'Repository is required',
    }).min(1).trim(),
  }).parse)
  return await new GithubService(event).sendSecrets(user.id, repository, variables)
})
