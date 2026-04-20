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

export type AuditLogQuery = {
  limit?: number
  cursor?: number
  action?: string
}
