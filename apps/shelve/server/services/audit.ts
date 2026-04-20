import type { H3Event } from 'h3'
import type { AuditAction, AuditActorType } from '@types'

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
    const actorId = session.user?.id ?? null
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
      metadata: payload.metadata ?? null,
    })
  } catch (err) {
    console.error('[audit] failed to record event', { action: payload.action, err })
  }
}
