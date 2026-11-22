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
    case 'variables.read': {
      const project = projectLabel(meta.projectId as number | undefined, maps, meta)
      if (log.resourceType !== 'project') return `Read secrets from ${project} / ${environmentLabel(resourceId, maps, meta)}`
      const environmentIds = Array.isArray(meta.environmentIds) ? meta.environmentIds as number[] : []
      return environmentIds.length
        ? `Read secrets from ${project} / ${environmentIds.map(id => environmentLabel(id, maps)).join(', ')}`
        : `Opened the secrets of ${project}`
    }
    case 'variables.create': {
      const keys = meta.keys as string[] | undefined
      const count = keys?.length ?? 0
      return `Created ${count} variable${count === 1 ? '' : 's'} in ${projectLabel(resourceId, maps, meta)}`
    }
    case 'variables.update':
      return meta.key
        ? `Updated variable ${meta.key}`
        : `Updated variable in ${projectLabel(meta.projectId as number | undefined, maps, meta)}`
    case 'variables.delete': {
      if (meta.key) return `Deleted variable ${meta.key}`
      const keys = meta.keys as string[] | undefined
      const project = projectLabel(meta.projectId as number | undefined, maps, meta)
      if (!keys) return `Deleted a variable in ${project}`
      return `Deleted ${keys.length} variable${keys.length === 1 ? '' : 's'} in ${project}`
    }
    case 'token.create':
      return `Created API token ${meta.name ?? maps.tokens.get(resourceId!)?.name ?? ''}`.trim()
    case 'token.delete':
      return `Deleted API token ${meta.name ?? maps.tokens.get(resourceId!)?.name ?? ''}`.trim()
    case 'project.create':
      return `Created project ${meta.name ?? maps.projects.get(resourceId!)?.name ?? ''}`.trim()
    case 'project.update': {
      const project = projectLabel(resourceId, maps, meta)
      const fields = Array.isArray(meta.fields) ? meta.fields as string[] : []
      return fields.includes('syncPolicy') ? `Changed the sync policy of ${project}` : `Updated project ${project}`
    }
    case 'project.delete':
      return `Deleted project ${meta.name ?? maps.projects.get(resourceId!)?.name ?? ''}`.trim()
    case 'environment.create':
      return `Created environment ${meta.name ?? maps.environments.get(resourceId!)?.name ?? ''}`.trim()
    case 'environment.update': {
      const name = meta.name ?? maps.environments.get(resourceId!)?.name ?? ''
      return meta.previousName ? `Renamed environment ${meta.previousName} to ${name}` : `Renamed environment to ${name}`.trim()
    }
    case 'environment.delete':
      return `Deleted environment ${meta.name ?? maps.environments.get(resourceId!)?.name ?? ''}`.trim()
    case 'team.member.invite':
      return `Invited ${meta.email ?? 'a member'}`
    case 'team.member.remove':
      return `Removed ${meta.email ?? meta.username ?? 'a member'}`
    case 'team.member.update':
      return `Changed ${meta.email ?? meta.username ?? 'a member'}'s role to ${meta.role ?? 'another role'}`
    case 'team.invitation.accept':
      return `${meta.email ?? meta.username ?? 'Someone'} joined the team as ${meta.role ?? 'a member'}`
    case 'team.invitation.cancel':
      return `Cancelled the invitation for ${meta.email ?? 'a member'}`
    case 'team.update':
      return meta.slug ? `Updated the team, now at /${meta.slug}` : 'Updated the team settings'
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
