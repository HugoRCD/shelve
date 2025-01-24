import { TeamRole } from '~~/packages/types'

const roleHierarchy = {
  [TeamRole.MEMBER]: 0,
  [TeamRole.ADMIN]: 1,
  [TeamRole.OWNER]: 2,
}

export function hasAccess(userRole?: TeamRole, requiredRole: TeamRole = TeamRole.MEMBER): boolean {
  if (!userRole) return false
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}
