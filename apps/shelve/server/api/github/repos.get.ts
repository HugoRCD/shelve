import { GitHubService } from '~~/server/services/github.service'

export default defineEventHandler(async (event) => {
  const githubService = new GitHubService()
  return await githubService.getUserRepos(event)
})
