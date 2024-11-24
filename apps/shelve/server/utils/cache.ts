const STORAGE_TYPE = 'cache'

const CACHE_PREFIX = {
  team: 'nitro:functions:getTeam:teamId:',
  teams: 'nitro:functions:getTeams:userId:',
  members: 'nitro:functions:getTeamMembers:teamId:'
}

export async function deleteCachedMembersByTeamId(teamId: number) {
  await useStorage(STORAGE_TYPE).removeItem(`${CACHE_PREFIX.members}${teamId}`)
}

export async function deleteCachedTeamById(teamId: number): Promise<void> {
  await useStorage(STORAGE_TYPE).removeItem(`${CACHE_PREFIX.team}${teamId}.json`)
}

export async function deleteCachedTeamsByUserId(userId: number): Promise<void> {
  await useStorage(STORAGE_TYPE).removeItem(`${CACHE_PREFIX.teams}${userId}.json`)
}

export async function deleteCachedForTeamMembers(teamId: number): Promise<void> {
  const members = await useDrizzle().query.members.findMany({ where: eq(tables.members.teamId, teamId) })
  await Promise.all(members.map(member => deleteCachedTeamsByUserId(member.userId)))
}
