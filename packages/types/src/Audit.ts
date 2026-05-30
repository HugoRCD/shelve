export type AuditActorType = 'user' | 'token' | 'system'

export type AuditAction =
  | 'token.create'
  | 'token.delete'
  | 'token.use'
  | 'variables.read'
  | 'variables.create'
  | 'variables.update'
  | 'variables.delete'
  | 'environment.create'
  | 'environment.update'
  | 'environment.delete'
  | 'project.create'
  | 'project.delete'
  | 'team.member.invite'
  | 'team.member.remove'
  | 'auth.login'
  | 'auth.logout'

export const AUDIT_ACTIONS: AuditAction[] = [
  'token.create',
  'token.delete',
  'token.use',
  'variables.read',
  'variables.create',
  'variables.update',
  'variables.delete',
  'environment.create',
  'environment.update',
  'environment.delete',
  'project.create',
  'project.delete',
  'team.member.invite',
  'team.member.remove',
]

export type AuditLog = {
  id: number
  teamId: number | null
  actorType: AuditActorType
  actorId: number | null
  action: AuditAction | string
  resourceType: string | null
  resourceId: string | null
  ip: string | null
  userAgent: string | null
  metadata: Record<string, unknown> | null
  createdAt: Date
}

export type AuditLogEntry = AuditLog & {
  actor: { type: AuditActorType; label: string; avatarUrl?: string }
  resource: { type: string; label: string; href?: string } | null
  client: { label: string; icon: string; raw: string | null }
  summary: string
  actionIcon: string
  actionColor: string
}

export type AuditLogQuery = {
  limit?: number
  cursor?: number
  action?: string
  actorType?: AuditActorType
  projectId?: number
}

export type AuditLogResponse = {
  logs: AuditLogEntry[]
  nextCursor: number | null
  total: number
}
