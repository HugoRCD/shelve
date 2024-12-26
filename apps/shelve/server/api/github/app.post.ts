import { GithubService } from '~~/server/services/github'

export default defineEventHandler(async (event) => {
  return await new GithubService().createGithubApp(event)
})
