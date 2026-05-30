import type { AuditLog, AuditLogEntry, AuditActorType } from '@types'
import { inArray } from 'drizzle-orm'
import { parseUserAgent } from '~~/server/utils/userAgent'
import {
  buildSummary,
  environmentLabelForAudit as environmentLabel,
  projectLabelForAudit as projectLabel,
  type AuditLookupMaps,
} from '~~/server/utils/audit-present'

type LookupMaps = AuditLookupMaps

function collectIds(logs: AuditLog[]) {
  const userIds = new Set<number>()
  const tokenIds = new Set<number>()
  const projectIds = new Set<number>()
  const environmentIds = new Set<number>()

  for (const log of logs) {
    if (log.actorType === 'user' && log.actorId) userIds.add(log.actorId)
    if (log.actorType === 'token' && log.actorId) tokenIds.add(log.actorId)
    if (log.resourceType === 'token' && log.resourceId) tokenIds.add(Number(log.resourceId))
    if (log.resourceType === 'project' && log.resourceId) projectIds.add(Number(log.resourceId))
    if (log.resourceType === 'environment' && log.resourceId) environmentIds.add(Number(log.resourceId))

    const meta = log.metadata ?? {}
    if (typeof meta.projectId === 'number') projectIds.add(meta.projectId)
    if (Array.isArray(meta.environmentIds)) {
      for (const id of meta.environmentIds) {
        if (typeof id === 'number') environmentIds.add(id)
      }
    }
  }

  return { userIds, tokenIds, projectIds, environmentIds }
}

async function buildLookupMaps(ids: ReturnType<typeof collectIds>, teamId: number): Promise<LookupMaps> {
  const users = new Map<number, { username: string; email: string; avatar: string }>()
  const tokens = new Map<number, { name: string; prefix: string }>()
  const projects = new Map<number, { name: string; teamId: number }>()
  const environments = new Map<number, { name: string; teamId: number }>()

  if (ids.userIds.size) {
    const rows = await db.query.users.findMany({
      where: inArray(schema.users.id, [...ids.userIds]),
      columns: { id: true, username: true, email: true, avatar: true },
    })
    for (const row of rows) users.set(row.id, row)
  }

  if (ids.tokenIds.size) {
    const rows = await db.query.tokens.findMany({
      where: inArray(schema.tokens.id, [...ids.tokenIds]),
      columns: { id: true, name: true, prefix: true },
    })
    for (const row of rows) tokens.set(row.id, row)
  }

  if (ids.projectIds.size) {
    const rows = await db.query.projects.findMany({
      where: and(
        inArray(schema.projects.id, [...ids.projectIds]),
        eq(schema.projects.teamId, teamId),
      ),
      columns: { id: true, name: true, teamId: true },
    })
    for (const row of rows) projects.set(row.id, row)
  }

  if (ids.environmentIds.size) {
    const rows = await db.query.environments.findMany({
      where: and(
        inArray(schema.environments.id, [...ids.environmentIds]),
        eq(schema.environments.teamId, teamId),
      ),
      columns: { id: true, name: true, teamId: true },
    })
    for (const row of rows) environments.set(row.id, row)
  }

  return { users, tokens, projects, environments }
}

function buildActor(log: AuditLog, maps: LookupMaps): AuditLogEntry['actor'] {
  const meta = log.metadata ?? {}

  if (log.actorType === 'user' && log.actorId) {
    const user = maps.users.get(log.actorId)
    return {
      type: 'user',
      label: user?.username ?? user?.email ?? `User #${log.actorId}`,
      avatarUrl: user?.avatar,
    }
  }

  if (log.actorType === 'token') {
    const token = log.actorId ? maps.tokens.get(log.actorId) : undefined
    const prefix = (meta.tokenPrefix as string | undefined) ?? token?.prefix
    const name = (meta.tokenName as string | undefined) ?? token?.name
    const parts = [prefix, name].filter(Boolean)
    return {
      type: 'token',
      label: parts.length ? parts.join(' · ') : 'API token',
    }
  }

  return { type: log.actorType as AuditActorType, label: 'System' }
}

function buildResource(
  log: AuditLog,
  maps: LookupMaps,
  teamSlug: string,
): AuditLogEntry['resource'] {
  if (!log.resourceType) return null

  const resourceId = log.resourceId ? Number(log.resourceId) : undefined
  const meta = log.metadata ?? {}

  switch (log.resourceType) {
    case 'project': {
      const name = projectLabel(resourceId, maps, meta)
      return {
        type: 'project',
        label: name,
        href: resourceId ? `/${teamSlug}/projects/${resourceId}` : undefined,
      }
    }
    case 'environment': {
      const projectName = projectLabel(meta.projectId as number | undefined, maps, meta)
      const envName = environmentLabel(resourceId, maps, meta)
      const projectId = meta.projectId as number | undefined
      return {
        type: 'environment',
        label: `${projectName} / ${envName}`,
        href: projectId ? `/${teamSlug}/projects/${projectId}` : `/${teamSlug}/environments`,
      }
    }
    case 'token': {
      const token = resourceId ? maps.tokens.get(resourceId) : undefined
      const name = (meta.name as string | undefined) ?? token?.name
      const prefix = (meta.prefix as string | undefined) ?? token?.prefix
      return {
        type: 'token',
        label: [prefix, name].filter(Boolean).join(' · ') || `token #${resourceId}`,
        href: '/user/tokens',
      }
    }
    case 'variable':
      return {
        type: 'variable',
        label: String(meta.key ?? `variable #${resourceId}`),
        href: meta.projectId ? `/${teamSlug}/projects/${meta.projectId}` : undefined,
      }
    default:
      return {
        type: log.resourceType,
        label: log.resourceId ? `${log.resourceType} #${log.resourceId}` : log.resourceType,
      }
  }
}

function actionIcon(action: string): { icon: string; color: string } {
  if (action.endsWith('.delete') || action.endsWith('.remove')) {
    return { icon: 'lucide:trash-2', color: 'text-error' }
  }
  if (action.endsWith('.create') || action.endsWith('.invite')) {
    return { icon: 'lucide:plus-circle', color: 'text-success' }
  }
  if (action.endsWith('.update')) {
    return { icon: 'lucide:pencil', color: 'text-warning' }
  }
  if (action.includes('.read') || action.includes('.pull')) {
    return { icon: 'lucide:eye', color: 'text-muted' }
  }
  if (action.startsWith('token.')) {
    return { icon: 'lucide:key-round', color: 'text-primary' }
  }
  return { icon: 'lucide:activity', color: 'text-muted' }
}

export async function enrichAuditLogs(
  logs: AuditLog[],
  teamSlug: string,
  teamId: number,
): Promise<AuditLogEntry[]> {
  if (!logs.length) return []

  const ids = collectIds(logs)
  const maps = await buildLookupMaps(ids, teamId)

  return logs.map((log) => {
    const parsed = parseUserAgent(log.userAgent)
    const { icon, color } = actionIcon(log.action)

    return {
      ...log,
      actor: buildActor(log, maps),
      resource: buildResource(log, maps, teamSlug),
      client: {
        label: parsed?.label ?? log.userAgent ?? 'Unknown client',
        icon: parsed?.icon ?? 'lucide:globe',
        raw: log.userAgent,
      },
      summary: buildSummary(log, maps),
      actionIcon: icon,
      actionColor: color,
    }
  })
}
