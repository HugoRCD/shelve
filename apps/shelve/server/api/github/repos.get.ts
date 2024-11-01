import type { H3Event } from 'h3'
import { getUserRepos } from '~~/server/services/github.service'

export default defineEventHandler(async (event: H3Event) => {
  return await getUserRepos(event)
})
