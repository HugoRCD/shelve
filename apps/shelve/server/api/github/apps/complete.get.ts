import { z } from 'zod'

const querySchema = z.object({
  installation_id: z.coerce.number().int().positive(),
})

export default defineEventHandler(async (event) => {
  const { user, secure } = await requireUserSession(event)
  const { installation_id: installationId } = await getValidatedQuery(event, querySchema.parse)

  // GitHub sends `installation_id` through the browser, so anyone could pass another account's id.
  // Only link installations that GitHub lists for this user.
  if (!secure?.githubToken) {
    return sendRedirect(event, '/user/integrations?integration=github&setup=signin-required')
  }
  const { installations } = await $fetch<{ installations: { id: number }[] }>('https://api.github.com/user/installations?per_page=100', {
    headers: {
      Authorization: `Bearer ${secure.githubToken}`,
      Accept: 'application/vnd.github+json',
    },
  }).catch(() => ({ installations: [] }))
  if (!installations.some(installation => installation.id === installationId)) {
    return sendRedirect(event, '/user/integrations?integration=github&setup=signin-required')
  }

  const existing = await db.query.githubApp.findFirst({
    where: and(eq(schema.githubApp.userId, user.id), eq(schema.githubApp.installationId, installationId)),
    columns: { id: true },
  })
  if (!existing) {
    await db.insert(schema.githubApp).values({ installationId, userId: user.id })
  }

  return sendRedirect(event, '/user/integrations?integration=github&setup=success')
})
