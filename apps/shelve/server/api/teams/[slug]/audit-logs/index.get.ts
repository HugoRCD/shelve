import { z } from 'zod'
import type { AuditLogResponse } from '@types'
import { sql } from 'drizzle-orm'

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.coerce.number().int().positive().optional(),
  action: z.string().min(1).max(64).optional(),
  actorType: z.enum(['user', 'token', 'system']).optional(),
  projectId: z.coerce.number().int().positive().optional(),
})

export default defineEventHandler(async (event): Promise<AuditLogResponse> => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug)
  const { limit, cursor, action, actorType, projectId } = await getValidatedQuery(event, querySchema.parse)

  await requireTokenScope(event, { teamId: team.id, permission: 'read' })

  const baseConditions = [eq(schema.auditLogs.teamId, team.id)]
  if (action) baseConditions.push(eq(schema.auditLogs.action, action))
  if (actorType) baseConditions.push(eq(schema.auditLogs.actorType, actorType))
  if (projectId) {
    baseConditions.push(
      or(
        and(
          eq(schema.auditLogs.resourceType, 'project'),
          eq(schema.auditLogs.resourceId, String(projectId)),
        ),
        sql`${schema.auditLogs.metadata}->>'projectId' = ${String(projectId)}`,
      )!,
    )
  }

  const where = and(...baseConditions)

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.auditLogs)
    .where(where)

  const pageConditions = [...baseConditions]
  if (cursor) pageConditions.push(lt(schema.auditLogs.id, cursor))

  const rows = await db.select()
    .from(schema.auditLogs)
    .where(and(...pageConditions))
    .orderBy(desc(schema.auditLogs.id))
    .limit(limit + 1)

  const logs = rows.slice(0, limit)
  const nextCursor = rows.length > limit ? rows[limit - 1]!.id : null
  const enriched = await enrichAuditLogs(logs, slug, team.id)

  return {
    logs: enriched,
    nextCursor,
    total: countRow?.count ?? 0,
  }
})
