import { GithubService } from '~~/server/services/github'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  return await new GithubService().getUserRepos(user.id)
})
