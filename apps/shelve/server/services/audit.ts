import type { H3Event } from 'h3'
import type { AuditAction, AuditActorType, TokenScopes } from '@types'
import { inArray } from 'drizzle-orm'

export type AuditEvent = {
  teamId?: number | null
  action: AuditAction | string
  resourceType?: string | null
  resourceId?: string | number | null
  metadata?: Record<string, unknown> | null
}

/**
 * Records an audit log entry derived from the current request session.
 *
 * Errors are swallowed: audit logging must never break the originating
 * request, but they are reported to the console for ops visibility.
 */
export async function logAudit(event: H3Event, payload: AuditEvent): Promise<void> {
  try {
    const session = await getUserSession(event)
    const actorType: AuditActorType = session.tokenScopes ? 'token' : session.user ? 'user' : 'system'
    const actorId = session.tokenScopes && session.tokenId
      ? session.tokenId
      : session.user?.id ?? null

    const tokenMeta = session.tokenScopes && session.tokenId
      ? { tokenPrefix: session.tokenPrefix, tokenName: session.tokenName }
      : {}

    const ip = getRequestIP(event, { xForwardedFor: true }) ?? null
    const userAgent = getRequestHeader(event, 'user-agent')?.slice(0, 256) ?? null

    await db.insert(schema.auditLogs).values({
      teamId: payload.teamId ?? null,
      actorType,
      actorId,
      action: payload.action,
      resourceType: payload.resourceType ?? null,
      resourceId: payload.resourceId !== undefined && payload.resourceId !== null ? String(payload.resourceId) : null,
      ip,
      userAgent,
      metadata: { ...tokenMeta, ...payload.metadata },
    })
  } catch (err) {
    console.error('[audit] failed to record event', { action: payload.action, err })
  }
}

/** Writes the same audit event once per team (e.g. token create/delete). */
export async function logAuditForTeams(
  event: H3Event,
  teamIds: number[],
  payload: Omit<AuditEvent, 'teamId'>,
): Promise<void> {
  const uniqueTeamIds = [...new Set(teamIds)]
  for (const teamId of uniqueTeamIds) {
    await logAudit(event, { ...payload, teamId })
  }
}

export async function getUserTeamIds(userId: number): Promise<number[]> {
  const memberships = await db.query.members.findMany({
    where: eq(schema.members.userId, userId),
    columns: { teamId: true },
  })
  return memberships.map(m => m.teamId)
}

export async function resolveTeamIdsFromTokenScopes(
  scopes: TokenScopes,
  userId: number,
): Promise<number[]> {
  if (scopes.teamIds?.length) {
    return scopes.teamIds
  }

  if (scopes.projectIds?.length) {
    const projects = await db.query.projects.findMany({
      where: inArray(schema.projects.id, scopes.projectIds),
      columns: { teamId: true },
    })
    const teamIds = [...new Set(projects.map(p => p.teamId))]
    if (teamIds.length) return teamIds
  }

  if (scopes.environmentIds?.length) {
    const environments = await db.query.environments.findMany({
      where: inArray(schema.environments.id, scopes.environmentIds),
      columns: { teamId: true },
    })
    const teamIds = [...new Set(environments.map(e => e.teamId))]
    if (teamIds.length) return teamIds
  }

  return getUserTeamIds(userId)
}
