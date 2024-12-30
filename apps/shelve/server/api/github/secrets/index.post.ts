import { z } from 'zod'
import { GithubService } from '~~/server/services/github'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { variables, repository } = await readValidatedBody(event, z.object({
    variables: z.array(z.object({
      key: z.string({
        required_error: 'Variable key is required',
      }).min(1).trim(),
      value: z.string({
        required_error: 'Variable value is required',
      }).min(1).trim(),
    })).min(1).max(100),
    repository: z.string({
      required_error: 'Repository is required',
    }).min(1).trim(),
  }).parse)
  return await new GithubService().sendSecrets(user.id, repository, variables)
})
