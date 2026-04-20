import { z } from 'zod'
import type { TokenWithSecret } from '@types'

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
  name: z.string({ error: 'Cannot create token without name' }).min(3).max(25).trim(),
  scopes: scopesSchema,
  expiresIn: z.number().int().positive().nullable().optional(),
  allowedCidrs: z.array(cidrSchema).optional(),
})

export default defineEventHandler(async (event): Promise<TokenWithSecret> => {
  const { name, scopes, expiresIn, allowedCidrs } = await readValidatedBody(event, bodySchema.parse)
  const { user } = await requireUserSession(event)

  const { token, prefix, hash } = generateToken()
  const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null

  const [created] = await db.insert(schema.tokens)
    .values({
      hash,
      prefix,
      name,
      userId: user.id,
      scopes: scopes ?? { permissions: ['read', 'write'] },
      allowedCidrs: allowedCidrs ?? [],
      expiresAt,
    })
    .returning()

  if (!created) throw createError({ statusCode: 500, statusMessage: 'Failed to create token' })

  await logAudit(event, {
    action: 'token.create',
    resourceType: 'token',
    resourceId: created.id,
    metadata: {
      name: created.name,
      prefix: created.prefix,
      expiresAt: created.expiresAt,
      scopes: created.scopes,
    },
  })

  return {
    ...created,
    token,
  }
})
