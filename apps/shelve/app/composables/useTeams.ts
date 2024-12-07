import type { Member, Team } from '@shelve/types'
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
  const teamSlug = useTeamSlug()
  return useState<Team>(`team-${teamSlug.value}`)
}

/**
 * Current selected team id
 */
export function useTeamId(): Ref<number> {
  const currentTeam = useTeam()
  return computed(() => currentTeam.value?.id)
}

export function useTeamSlug(): Ref<string> {
  const route = useRoute()
  return computed(() => route.params.teamSlug as string)
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

export function useTeamsService() {
  const router = useRouter()
  const teams = useTeams()
  const currentTeam = useTeam()
  const teamId = useTeamId()
  const baseUrl = computed(() => `/api/teams`)
  const loading = ref(false)
  const createLoading = ref(false)

  const defaultTeamId = useCookie<number>('defaultTeamId', {
    watch: true,
  })

  async function fetchTeams() {
    loading.value = true
    try {
      teams.value = await $fetch<Team[]>(baseUrl.value, { method: 'GET' })
    } catch (error) {
      toast.error('Failed to fetch teams')
    }
    loading.value = false
  }

  async function fetchTeam(id: number) {
    return await $fetch<Team>(`${baseUrl.value}/${id}`, {
      method: 'GET',
    })
  }

  async function selectTeam(team: Team, redirect = true) {
    currentTeam.value = team
    defaultTeamId.value = team.id
    if (redirect) await router.push(`/${ currentTeam.value.slug }`)
  }

  async function createTeam(name: string): Promise<Team | undefined> {
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
      createLoading.value = false
      return team
    } catch (error) {
      toast.error('Failed to create team')
    }
    createLoading.value = false
  }

  async function updateTeam(input: { name: string, logo: string, slug: string }) {
    currentTeam.value = await $fetch<Team>(`${baseUrl.value}/${ teamId.value }`, {
      method: 'PUT',
      body: input
    })
    await router.push(`/${ currentTeam.value.slug }`)
  }

  async function addMember(email: string, role: TeamRole) {
    const _member = await $fetch<Member>(`${baseUrl.value}/${teamId.value}/members`, {
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
    const _member = await $fetch<Member>(`${baseUrl.value}/${teamId.value}/members/${memberId}`, {
      method: 'PUT',
      body: {
        role,
      },
    })
    const index = currentTeam.value.members.findIndex((member) => member.id === memberId)
    currentTeam.value.members[index] = _member
  }

  async function removeMember(memberId: number) {
    await $fetch<Member>(`${baseUrl.value}/${teamId.value}/members/${memberId}`, {
      method: 'DELETE',
    })
    currentTeam.value.members = currentTeam.value.members.filter((member) => member.id !== memberId)
  }

  async function deleteTeam() {
    if (teams.value.length === 1) {
      toast.error('You cannot delete the last team')
      return
    }
    await $fetch(`${baseUrl.value}/${teamId.value}`, {
      method: 'DELETE',
    })
    teams.value = teams.value.filter((team) => team.id !== teamId.value)
    if (teams.value && teams.value.length)
      await selectTeam(teams.value[0]!)
    else
      await router.push('/')
  }

  return {
    teams,
    loading,
    createLoading,
    fetchTeam,
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
