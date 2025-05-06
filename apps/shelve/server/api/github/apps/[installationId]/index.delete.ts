import type { H3Event } from 'h3'
import { z } from 'zod'

export default defineEventHandler(async (event: H3Event) => {
  const { user } = await requireUserSession(event)
  const { installationId } = await getValidatedRouterParams(event, z.object({
    installationId: z.coerce.number({
      required_error: 'installationId is required',
    }).int().positive(),
  }).parse)
  return await new GithubService(event).deleteApp(user.id, installationId)
})
