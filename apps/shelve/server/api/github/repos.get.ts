import type { H3Event } from 'h3'
import { GitHubService } from '~~/server/services/github.service'

export default defineEventHandler(async (event: H3Event) => {
  const githubService = new GitHubService()
  return await githubService.getUserRepos(event)
})
