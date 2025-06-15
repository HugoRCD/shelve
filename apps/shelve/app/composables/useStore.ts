import type { Environment, Project, Team, Variable } from '@types'

/**
 * All user teams (always load on app start/refresh)
 */
export function useTeams(): Ref<Team[]> {
  return useState<Team[]>('teams', () => [])
}

/**
 * Current selected team
 */
export function useTeam(): Ref<Team> {
  return useState<Team>('team')
}

/**
 * All current team projects (load on the '/' route)
 */
export function useProjects(teamSlug: string): Ref<Project[]> {
  return useState<Project[]>(`${teamSlug}-projects`)
}

/**
 * Current selected project (active project context)
 * Only available on route under '/projects/:projectId'
 */
export function useProject(projectId: string): Ref<Project> {
  return useState<Project>(`project-${projectId}`)
}

/**
 * Current selected team environments
 */
export function useEnvironments(): Ref<Environment[]> {
  return useState<Environment[]>('environments', () => [])
}

/**
 * Current project variables
 */
export function useVariables(projectId: string): Ref<Variable[]> {
  return useState<Variable[]>(`variables-${projectId}`)
}

export function useNavbarLoading(): Ref<boolean> {
  return useState<boolean>('navbar-loading', () => false)
}
