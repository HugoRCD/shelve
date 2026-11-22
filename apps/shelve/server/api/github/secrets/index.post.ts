import { z } from 'zod'
import { sanitizeGithubUrl } from '@utils'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { variables, repository } = await readValidatedBody(event, z.object({
    variables: z.array(z.object({
      key: z.string({
        error: 'Variable key is required',
      }).trim().regex(/^[A-Za-z_][A-Za-z0-9_]*$/, 'Secret names can only contain letters, digits and underscores'),
      value: z.string({
        error: 'Variable value is required',
      }).min(1).trim(),
    })).min(1).max(100),
    repository: z.string({
      error: 'Repository is required',
    }).trim().transform(url => sanitizeGithubUrl(url).replace(/\/+$/, '')).pipe(z.string().regex(/^[\w.-]+\/[\w.-]+$/, 'Repository must be owner/name')),
  }).parse)
  return await new GithubService(event).sendSecrets(user.id, repository, variables)
})
