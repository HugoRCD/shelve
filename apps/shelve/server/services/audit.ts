import type { H3Event } from 'h3'
import type { AuditAction, AuditActorType, Member, TeamRole, TokenScopes } from '@types'
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
    const auth = await getAuth(event)
    const actorType: AuditActorType = auth?.token ? 'token' : auth ? 'user' : 'system'
    const actorId = auth?.token ? auth.token.id : auth?.user.id ?? null

    const tokenMeta = auth?.token
      ? { tokenPrefix: auth.token.prefix, tokenName: auth.token.name }
      : {}

    const ip = getClientIp(event)
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

  await pruneExpiredAuditLogs()
}

const PRUNE_INTERVAL_MS = 60 * 60 * 1000
const PRUNE_BATCH_SIZE = 5000
let nextPruneAt = 0

/** Deletes up to one batch of audit entries older than `retentionDays` and returns how many it deleted. */
export async function pruneAuditLogs(retentionDays: number, now = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000)
  const expired = db.select({ id: schema.auditLogs.id })
    .from(schema.auditLogs)
    .where(lt(schema.auditLogs.createdAt, cutoff))
    .limit(PRUNE_BATCH_SIZE)
  const deleted = await db.delete(schema.auditLogs)
    .where(inArray(schema.auditLogs.id, expired))
    .returning({ id: schema.auditLogs.id })
  return deleted.length
}

/**
 * Runs `pruneAuditLogs` at most once an hour per server instance, so retention needs no cron.
 * A retention that isn't a positive number of days keeps every entry.
 */
async function pruneExpiredAuditLogs(): Promise<void> {
  const retentionDays = Number(useRuntimeConfig().private.auditRetentionDays)
  if (!(retentionDays > 0) || Date.now() < nextPruneAt) return
  nextPruneAt = Date.now() + PRUNE_INTERVAL_MS
  try {
    await pruneAuditLogs(retentionDays)
  } catch (err) {
    console.error('[audit] failed to prune expired entries', { err })
  }
}

export async function logMemberRoleChange(event: H3Event, teamId: number, member: Member, previousRole: TeamRole): Promise<void> {
  await logAudit(event, {
    teamId,
    action: 'team.member.update',
    resourceType: 'user',
    resourceId: member.userId,
    metadata: {
      email: member.user?.email,
      username: member.user?.username,
      role: member.role,
      previousRole,
    },
  })
}

/** Writes the same audit event once per team (e.g. token create/delete). */
export async function logAuditForTeams(
  event: H3Event,
  teamIds: number[],
  payload: Omit<AuditEvent, 'teamId'>,
): Promise<void> {
  const uniqueTeamIds = [...new Set(teamIds)]
  await Promise.all(
    uniqueTeamIds.map(teamId =>
      logAudit(event, { ...payload, teamId }).catch(err => {
        console.error('[audit] failed to record team event', { action: payload.action, teamId, err })
      }),
    ),
  )
}

export async function getUserTeamIds(userId: number): Promise<number[]> {
  const memberships = await db.query.members.findMany({
    where: eq(schema.members.userId, userId),
    columns: { teamId: true },
  })
  return memberships.map(m => m.teamId)
}

/** The teams a token event is logged to: those its scopes name, limited to the teams the user belongs to. */
export async function resolveTeamIdsFromTokenScopes(
  scopes: TokenScopes,
  userId: number,
): Promise<number[]> {
  const userTeamIds = await getUserTeamIds(userId)
  const scopedTeamIds = await getScopedTeamIds(scopes)
  return scopedTeamIds ? scopedTeamIds.filter(id => userTeamIds.includes(id)) : userTeamIds
}

async function getScopedTeamIds(scopes: TokenScopes): Promise<number[] | null> {
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

  return null
}
