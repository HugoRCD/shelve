import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { q } = await getValidatedQuery(event, z.object({
    q: z.string().optional(),
  }).parse)
  const repos = await new GithubService(event).getUserRepos(event, user.id)

  return repos?.filter((repo) => {
    const name = repo.name.toLowerCase()
    const query = q?.toLowerCase()
    return !query || name.includes(query)
  })
})
