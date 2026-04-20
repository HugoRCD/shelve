import { z } from 'zod'
import type { AuditLog } from '@types'

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.coerce.number().int().positive().optional(),
  action: z.string().min(1).max(64).optional(),
})

export default defineEventHandler(async (event): Promise<{ logs: AuditLog[]; nextCursor: number | null }> => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug)
  const { limit, cursor, action } = await getValidatedQuery(event, querySchema.parse)

  await requireTokenScope(event, { teamId: team.id, permission: 'read' })

  const conditions = [eq(schema.auditLogs.teamId, team.id)]
  if (cursor) conditions.push(lt(schema.auditLogs.id, cursor))
  if (action) conditions.push(eq(schema.auditLogs.action, action))

  const rows = await db.select()
    .from(schema.auditLogs)
    .where(and(...conditions))
    .orderBy(desc(schema.auditLogs.id))
    .limit(limit + 1)

  const logs = rows.slice(0, limit) as AuditLog[]
  const nextCursor = rows.length > limit ? rows[limit - 1]!.id : null

  return { logs, nextCursor }
})
