import type { Environment, Member, Team } from '@shelve/types'
import { Role, TeamRole } from '@shelve/types'

/**
 * All user teams (always load on app start/refresh)
 */
export function useTeams(): Ref<Team[]> {
  return useState<Team[]>('teams', () => [])
}

/**
 * Current selected team (current workspace context)
 */
export function useTeam(): Ref<Team> {
  return useState<Team>('team')
}

/**
 * Current selected team environments
 */
export function useTeamEnv(): Ref<Environment[]> {
  return useState<Environment[]>('teamEnv', () => [])
}

/**
 * Current selected team id
 */
export function useTeamId(): Ref<number> {
  const currentTeam = useTeam()
  return computed(() => currentTeam.value?.id)
}

/**
 * Current selected team user role in the team
 * If user is an admin, the role is set to OWNER
 */
export function useTeamRole(): Ref<TeamRole> {
  const currentTeam = useTeam()
  const { user } = useUserSession()
  return computed(() => {
    if (!currentTeam.value) return TeamRole.MEMBER
    if (user.value!.role === Role.ADMIN) return TeamRole.OWNER
    const member = currentTeam.value.members.find(member => member.userId === user.value!.id)
    return member?.role || TeamRole.MEMBER
  })
}

/**
 * Check if the current selected team is a private team
 * Private teams can't be deleted (they act as a default team for a given user)
 */
export function isPrivateTeam(): Ref<boolean> {
  const currentTeam = useTeam()
  return computed(() => currentTeam.value?.private)
}

export function useTeamsService() {
  const teams = useTeams()
  const currentTeam = useTeam()
  const teamId = useTeamId()
  const teamEnv = useTeamEnv()
  const { user } = useUserSession()
  const loading = ref(false)
  const createLoading = ref(false)

  const lastUsedTeamId = useCookie<number>('lastUsedTeam', {
    watch: true,
  })

  async function fetchTeams() {
    loading.value = true

    try {
      const fetchedTeams = await $fetch<Team[]>('/api/teams', { method: 'GET' })

      if (!fetchedTeams) throw new Error('Failed to fetch teams')

      teams.value = fetchedTeams

      const privateTeam = teams.value.find(team => team.private && team.members.some(member => member.userId === user.value!.id))
      lastUsedTeamId.value = lastUsedTeamId.value || privateTeam!.id
      currentTeam.value = teams.value.find(team => team.id === lastUsedTeamId.value) as Team
      teamEnv.value = currentTeam.value.environments
    } finally {
      loading.value = false
    }
  }

  async function selectTeam(id: number) {
    const projects = useProjectsService()
    const route = useRoute()
    currentTeam.value = teams.value.find(team => team.id === id) as Team
    teamEnv.value = currentTeam.value.environments
    lastUsedTeamId.value = id
    if (route.path.includes('/project/')) navigateTo('/')
    await projects.fetchProjects()
  }

  async function createTeam(name: string) {
    createLoading.value = true
    try {
      const team = await $fetch<Team>('/api/teams', {
        method: 'POST',
        body: {
          name
        },
      })
      const index = teams.value.findIndex((team) => team.id === teamId.value)
      if (!index)
        teams.value.push(team)
      toast.success('Team created')
    } catch (error) {
      toast.error('Failed to create team')
    }
    createLoading.value = false
  }

  async function updateTeam(input: { name: string, logo: string }) {
    const { name, logo } = input
    currentTeam.value = await $fetch<Team>(`/api/teams/${ teamId.value }`, {
      method: 'PUT',
      body: {
        name,
        logo,
      },
    })
  }

  async function addMember(email: string, role: TeamRole) {
    const _member = await $fetch<Member>(`/api/teams/${teamId.value}/members`, {
      method: 'POST',
      body: {
        email,
        role,
      },
    })
    const member = currentTeam.value.members.find((member) => member.userId === _member.userId)
    if (!member)
      currentTeam.value.members.push(_member)
  }

  async function updateMember(memberId: number, role: TeamRole) {
    const _member = await $fetch<Member>(`/api/teams/${teamId.value}/members/${memberId}`, {
      method: 'PUT',
      body: {
        role,
      },
    })
    const index = currentTeam.value.members.findIndex((member) => member.id === memberId)
    currentTeam.value.members[index] = _member
  }

  async function removeMember(memberId: number) {
    await $fetch<Member>(`/api/teams/${teamId.value}/members/${memberId}`, {
      method: 'DELETE',
    })
    currentTeam.value.members = currentTeam.value.members.filter((member) => member.id !== memberId)
  }

  async function deleteTeam() {
    if (teams.value.length === 1) {
      toast.error('You cannot delete the last team')
      return
    }
    if (currentTeam.value.private) {
      toast.error('You cannot delete the private team')
      return
    }
    await $fetch(`/api/teams/${teamId.value}`, {
      method: 'DELETE',
    })
    teams.value = teams.value.filter((team) => team.id !== teamId.value)
    await selectTeam(teams.value[0]!.id)
  }

  return {
    teams,
    loading,
    createLoading,
    fetchTeams,
    selectTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    addMember,
    updateMember,
    removeMember,
  }
}
