import type { Environment, Project, Team, Variable } from '@shelve/types'

/**
 * All user teams (always load on app start/refresh)
 */
export function useTeams() {
  return useState<Team[]>('teams', () => [])
}

/**
 * Current selected team (current workspace context)
 */
export function useTeam() {
  const defaultTeamSlug = useCookie<string>('defaultTeamSlug')
  return useState<Team>(`team-${defaultTeamSlug.value}`)
}

/**
 * All current team projects (load on the '/' route)
 */
export function useProjects(teamSlug: string) {
  return useState<Project[]>(`${teamSlug}-projects`)
}

/**
 * Current selected project (active project context)
 * Only available on route under '/projects/:projectId'
 */
export function useProject(projectId: number) {
  return useState<Project>(`project-${projectId}`)
}

/**
 * Current selected team environments
 */
export function useEnvironments() {
  return useState<Environment[]>('environments', () => [])
}

/**
 * Current project variables
 */
export function useVariables(projectId: number) {
  return useState<Variable[]>(`variables-${projectId}`)
}
