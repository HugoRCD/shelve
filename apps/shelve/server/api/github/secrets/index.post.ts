import { z } from 'zod'
import { sanitizeGithubUrl } from '@utils'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)
  const { variables, repository } = await readValidatedBody(event, z.object({
    variables: z.array(z.object({
      key: z.string({
        error: 'Variable key is required',
      }).trim().regex(GITHUB_SECRET_NAME_PATTERN, GITHUB_SECRET_NAME_MESSAGE),
      value: z.string({
        error: 'Variable value is required',
      }).min(1).trim(),
    })).min(1).max(100),
    repository: z.string({
      error: 'Repository is required',
    }).trim().transform(url => sanitizeGithubUrl(url).replace(/\/+$/, '')).pipe(z.string().regex(GITHUB_REPOSITORY_PATTERN, 'Repository must be owner/name')),
  }).parse)
  return await new GithubService(event).sendSecrets(user.id, repository, variables, requireGithubToken(await getGithubToken(event)))
})
