import type { Member, Team } from '@shelve/types'
import { Role, TeamRole } from '@shelve/types'

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
  const loading = ref(false)
  const createLoading = ref(false)

  const defaultTeamSlug = useCookie<string>('defaultTeamSlug')

  async function fetchTeams() {
    loading.value = true
    try {
      teams.value = await $fetch<Team[]>('/api/teams', { method: 'GET' })
    } catch (error) {
      toast.error('Failed to fetch teams')
    }
    loading.value = false
  }

  async function fetchTeam(slug: number) {
    return await $fetch<Team>(`/api/teams/${slug}`, {
      method: 'GET',
    })
  }

  async function selectTeam(team: Team, redirect = true) {
    currentTeam.value = team
    defaultTeamSlug.value = team.slug
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
      const index = teams.value.findIndex((team) => team.id === currentTeam.value.id)
      if (!index)
        teams.value.push(team)
      toast.success('Team created')
      createLoading.value = false
      return team
    } catch (error: any) {
      if (error.statusCode === 409)
        toast.error(error.statusMessage)
      else
        toast.error('Failed to create team')
    }
    createLoading.value = false
  }

  async function updateTeam(input: { name: string, logo: string, slug: string }) {
    currentTeam.value = await $fetch<Team>(`/api/teams/${currentTeam.value.slug}`, {
      method: 'PUT',
      body: input
    })
    defaultTeamSlug.value = currentTeam.value.slug
    await router.push(`/${ currentTeam.value.slug }`)
  }

  async function addMember(email: string, role: TeamRole) {
    const _member = await $fetch<Member>(`/api/teams/${currentTeam.value.slug}/members`, {
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
    const _member = await $fetch<Member>(`/api/teams/${currentTeam.value.slug}/members/${memberId}`, {
      method: 'PUT',
      body: {
        role,
      },
    })
    const index = currentTeam.value.members.findIndex((member) => member.id === memberId)
    currentTeam.value.members[index] = _member
  }

  async function removeMember(memberId: number) {
    await $fetch<Member>(`/api/teams/${currentTeam.value.slug}/members/${memberId}`, {
      method: 'DELETE',
    })
    currentTeam.value.members = currentTeam.value.members.filter((member) => member.id !== memberId)
  }

  async function deleteTeam() {
    if (teams.value.length === 1) {
      toast.error('You cannot delete the last team')
      return
    }
    await $fetch(`/api/teams/${currentTeam.value.slug}`, {
      method: 'DELETE',
    })
    teams.value = teams.value.filter((team) => team.id !== currentTeam.value.id)
    if (teams.value && teams.value.length) {
      await selectTeam(teams.value[0] as Team)
    } else {
      await router.push('/')
    }
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
