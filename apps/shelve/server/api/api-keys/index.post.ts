import { z } from 'zod'
import type { ApiKeyWithSecret } from '@types'

const cidrSchema = z.string().regex(
  /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}\/(?:3[0-2]|[12]?\d))$|^(?:[A-Fa-f0-9:]+)\/(?:12[0-8]|1[01]\d|[1-9]?\d)$/,
  'Invalid CIDR notation'
)

const scopesSchema = z.object({
  teamIds: z.array(z.number().int().positive()).optional(),
  projectIds: z.array(z.number().int().positive()).optional(),
  environmentIds: z.array(z.number().int().positive()).optional(),
  permissions: z.array(z.enum(['read', 'write'])).min(1),
}).optional()

const bodySchema = z.object({
  name: z.string({ error: 'Cannot create API key without name' }).min(3).max(25).trim(),
  scopes: scopesSchema,
  expiresIn: z.number().int().positive().nullable().optional(),
  allowedCidrs: z.array(cidrSchema).optional(),
})

export default defineEventHandler(async (event): Promise<ApiKeyWithSecret> => {
  const { name, scopes, expiresIn, allowedCidrs } = await readValidatedBody(event, bodySchema.parse)
  const { user } = await requireAuth(event)

  const { key, start, hashedKey } = await generateApiKey()
  const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null

  const [created] = await db.insert(schema.apiKeys)
    .values({
      key: hashedKey,
      start,
      name,
      referenceId: user.id,
      scopes: scopes ?? { permissions: ['read', 'write'] },
      allowedCidrs: allowedCidrs ?? [],
      expiresAt,
    })
    .returning()

  if (!created) throw createError({ statusCode: 500, statusMessage: 'Failed to create API key' })

  const teamIds = await resolveTeamIdsFromApiKeyScopes(created.scopes, user.id)

  await logAuditForTeams(event, teamIds, {
    action: 'token.create',
    resourceType: 'token',
    resourceId: created.id,
    metadata: {
      name: created.name,
      prefix: created.start,
      expiresAt: created.expiresAt,
      scopes: created.scopes,
    },
  })

  return {
    ...created,
    key,
  }
})
