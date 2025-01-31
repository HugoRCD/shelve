import { H3Event } from 'h3'
import { z } from 'zod'
import { GithubService } from '~~/server/services/github'

export default defineEventHandler(async (event: H3Event) => {
  const { user } = await requireUserSession(event)
  const { slug } = await getValidatedRouterParams(event, z.object({
    slug: z.string({ required_error: 'slug is required' }),
  }).parse)
  return await new GithubService(event).deleteApp(user.id, slug)
})
