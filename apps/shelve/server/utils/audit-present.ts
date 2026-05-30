import type { AuditLog } from '@types'

export type AuditLookupMaps = {
  users: Map<number, { username: string; email: string; avatar: string }>
  tokens: Map<number, { name: string; prefix: string }>
  projects: Map<number, { name: string; teamId: number }>
  environments: Map<number, { name: string; teamId: number }>
}

function projectLabel(id: number | undefined, maps: AuditLookupMaps, meta?: Record<string, unknown>): string {
  if (meta?.projectName && typeof meta.projectName === 'string') return meta.projectName
  if (id && maps.projects.has(id)) return maps.projects.get(id)!.name
  if (id) return `project #${id} (deleted)`
  return 'project'
}

function environmentLabel(id: number | undefined, maps: AuditLookupMaps, meta?: Record<string, unknown>): string {
  if (meta?.environmentName && typeof meta.environmentName === 'string') return meta.environmentName
  if (id && maps.environments.has(id)) return maps.environments.get(id)!.name
  if (id) return `environment #${id} (deleted)`
  return 'environment'
}

export function buildSummary(log: AuditLog, maps: AuditLookupMaps): string {
  const meta = log.metadata ?? {}
  const resourceId = log.resourceId ? Number(log.resourceId) : undefined

  switch (log.action) {
    case 'variables.read':
      return `Read secrets from ${projectLabel(meta.projectId as number | undefined, maps, meta)} / ${environmentLabel(resourceId, maps, meta)}`
    case 'variables.create': {
      const keys = meta.keys as string[] | undefined
      const count = keys?.length ?? 0
      return `Created ${count} variable${count === 1 ? '' : 's'} in ${projectLabel(resourceId, maps, meta)}`
    }
    case 'variables.update':
      return meta.key
        ? `Updated variable ${meta.key}`
        : `Updated variable in ${projectLabel(meta.projectId as number | undefined, maps, meta)}`
    case 'variables.delete':
      return meta.key
        ? `Deleted variable ${meta.key}`
        : `Deleted a variable in ${projectLabel(meta.projectId as number | undefined, maps, meta)}`
    case 'token.create':
      return `Created API token ${meta.name ?? maps.tokens.get(resourceId!)?.name ?? ''}`.trim()
    case 'token.delete':
      return `Deleted API token ${meta.name ?? maps.tokens.get(resourceId!)?.name ?? ''}`.trim()
    case 'project.create':
      return `Created project ${meta.name ?? maps.projects.get(resourceId!)?.name ?? ''}`.trim()
    case 'project.delete':
      return `Deleted project ${meta.name ?? maps.projects.get(resourceId!)?.name ?? ''}`.trim()
    case 'environment.create':
      return `Created environment ${meta.name ?? maps.environments.get(resourceId!)?.name ?? ''}`.trim()
    case 'environment.update':
      return `Renamed environment to ${meta.name ?? maps.environments.get(resourceId!)?.name ?? ''}`.trim()
    case 'environment.delete':
      return `Deleted environment ${meta.name ?? maps.environments.get(resourceId!)?.name ?? ''}`.trim()
    case 'team.member.invite':
      return `Invited ${meta.email ?? 'a member'}`
    case 'team.member.remove':
      return `Removed ${meta.email ?? meta.username ?? 'a member'}`
    default:
      return log.action.replace(/\./g, ' · ')
  }
}

export function projectLabelForAudit(id: number | undefined, maps: AuditLookupMaps, meta?: Record<string, unknown>): string {
  return projectLabel(id, maps, meta)
}

export function environmentLabelForAudit(id: number | undefined, maps: AuditLookupMaps, meta?: Record<string, unknown>): string {
  return environmentLabel(id, maps, meta)
}
