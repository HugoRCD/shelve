const STORAGE_TYPE = 'cache'

const CACHE_PREFIX = 'nitro:functions:'

const CACHE_KEY = {
  team: 'getTeam:teamId:',
  teams: 'getTeams:userId:',
  members: 'getTeamMembers:teamId:',
  project: 'getProject:projectId:',
  projects: 'getProjects:teamId:',
  variables: 'getVariables:projectId:'
}

export async function deleteCachedMembersByTeamId(teamId: number) {
  await useStorage(STORAGE_TYPE).removeItem(`${CACHE_PREFIX}${CACHE_KEY.members}${teamId}.json`)
}

export async function deleteCachedTeamById(teamId: number): Promise<void> {
  await useStorage(STORAGE_TYPE).removeItem(`${CACHE_PREFIX}${CACHE_KEY.team}${teamId}.json`)
}

export async function deleteCachedTeamsByUserId(userId: number): Promise<void> {
  await useStorage(STORAGE_TYPE).removeItem(`${CACHE_PREFIX}${CACHE_KEY.teams}${userId}.json`)
}

export async function deleteCachedForTeamMembers(teamId: number): Promise<void> {
  await deleteCachedTeamById(teamId)
  const members = await useDrizzle().query.members.findMany({ where: eq(tables.members.teamId, teamId) })
  await Promise.all(members.map(member => deleteCachedTeamsByUserId(member.userId)))
}

export async function deleteCachedProjectVariables(projectId: number): Promise<void> {
  await useStorage(STORAGE_TYPE).removeItem(`${CACHE_PREFIX}${CACHE_KEY.variables}${projectId}.json`)
}

export async function deleteCachedTeamProjects(teamId: number): Promise<void> {
  await useStorage(STORAGE_TYPE).removeItem(`${CACHE_PREFIX}${CACHE_KEY.projects}${teamId}.json`)
}

export async function deleteCachedProjectById(id: number): Promise<void> {
  await useStorage(STORAGE_TYPE).removeItem(`${CACHE_PREFIX}${CACHE_KEY.project}${id}.json`)
}
