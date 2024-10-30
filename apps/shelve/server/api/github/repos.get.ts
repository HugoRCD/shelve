import { H3Event } from 'h3'
import { getUserRepos } from '~~/server/app/githubService'

export default defineEventHandler(async (event: H3Event) => {
  return await getUserRepos(event)
})
