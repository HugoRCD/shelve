import { z } from 'zod'

const querySchema = z.object({
  installation_id: z.coerce.number().int().positive(),
})

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)
  const githubToken = await getGithubToken(event)
  const { installation_id: installationId } = await getValidatedQuery(event, querySchema.parse)

  // GitHub sends `installation_id` through the browser, so anyone could pass another account's id.
  // Only link installations that GitHub lists for this user. Sign-in replaces the whole session,
  // so this token always belongs to the signed-in user.
  if (!githubToken || !await canAccessInstallation(githubToken, installationId)) {
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

async function canAccessInstallation(githubToken: string, installationId: number): Promise<boolean> {
  for (let page = 1; page <= 10; page++) {
    const { installations } = await $fetch<{ installations: { id: number }[] }>('https://api.github.com/user/installations', {
      query: { per_page: 100, page },
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json',
      },
    }).catch(() => ({ installations: [] }))
    if (installations.some(installation => installation.id === installationId)) return true
    if (installations.length < 100) return false
  }
  return false
}
