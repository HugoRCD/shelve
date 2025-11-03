import type { Member, Team } from '@types'
import { Role, TeamRole } from '@types'

/**
 * Current selected team user role in the team
 * If user is an admin, the role is set to OWNER
 */
export function useTeamRole(): Ref<TeamRole> {
  const team = useTeam()
  const { user } = useUserSession()
  return computed(() => {
    if (!team.value) return TeamRole.MEMBER
    if (user.value?.role === Role.ADMIN) return TeamRole.OWNER
    const member = team.value.members.find(member => member.userId === user.value?.id)
    return member?.role || TeamRole.MEMBER
  })
}

export function useTeamsService() {
  const router = useRouter()
  const teams = useTeams()
  const team = useTeam()
  const loading = ref(false)
  const createLoading = ref(false)
  const navbarLoading = useNavbarLoading()

  const defaultTeamSlug = useCookie<string>('defaultTeamSlug')

  async function fetchTeams() {
    loading.value = true
    try {
      teams.value = await $fetch<Team[]>('/api/teams', { method: 'GET' })
    } catch (error) {
      toast.error('Failed to fetch teams')
    } finally {
      loading.value = false
    }
  }

  async function fetchTeam(slug: string) {
    team.value = await $fetch<Team>(`/api/teams/${slug}`, {
      method: 'GET',
    })
  }

  async function selectTeam(team: Team) {
    await router.push(`/${team.slug}`)
  }

  async function createTeam(name: string): Promise<Team | undefined> {
    createLoading.value = true
    navbarLoading.value = true
    try {
      const team = await $fetch<Team>('/api/teams', {
        method: 'POST',
        body: { name },
      })

      teams.value.push(team)

      toast.success('Team created')
      return team
    } catch (error: any) {
      console.error(error)
      if (error.statusCode === 409) // Team already exists
        toast.error('A team with this name already exists. Please choose another name.')
      else
        toast.error('Failed to create team')
    } finally {
      createLoading.value = false
      navbarLoading.value = false
    }
  }

  async function updateTeam(input: { name: string, logo: string, slug: string }) {
    try {
      const updatedTeam = await $fetch<Team>(`/api/teams/${team.value.slug}`, {
        method: 'PUT',
        body: input
      })

      const index = teams.value.findIndex(team => team.id === updatedTeam.id)
      if (index !== -1) {
        teams.value[index] = updatedTeam
      }

      team.value = updatedTeam
      defaultTeamSlug.value = updatedTeam.slug
      await router.push(`/${updatedTeam.slug}`)
    } catch (error) {
      toast.error('Failed to update team')
    }
  }

  async function addMember(email: string, role: TeamRole) {
    try {
      const newMember = await $fetch<Member>(`/api/teams/${team.value.slug}/members`, {
        method: 'POST',
        body: {
          email,
          role,
        },
      })

      const existingMember = team.value.members.find(member => member.userId === newMember.userId)
      if (!existingMember) {
        team.value.members.push(newMember)
      }

      updateTeamInList(team.value)
    } catch (error) {
      toast.error('Failed to add member')
    }
  }

  async function updateMember(memberId: number, role: TeamRole) {
    try {
      const updatedMember = await $fetch<Member>(`/api/teams/${team.value.slug}/members/${memberId}`, {
        method: 'PUT',
        body: { role },
      })

      const index = team.value.members.findIndex(member => member.id === memberId)
      if (index !== -1) {
        team.value.members[index] = updatedMember
      }

      updateTeamInList(team.value)

      toast.success('Member updated successfully')
    } catch (error) {
      toast.error('Failed to update member')
    }
  }

  async function removeMember(memberId: number) {
    try {
      await $fetch<Member>(`/api/teams/${team.value.slug}/members/${memberId}`, {
        method: 'DELETE',
      })

      team.value.members = team.value.members.filter(member => member.id !== memberId)

      updateTeamInList(team.value)

      toast.success('Member removed successfully')
    } catch (error) {
      toast.error('Failed to remove member')
    }
  }

  function updateTeamInList(team: Team) {
    const index = teams.value.findIndex(t => t.id === team.id)
    if (index !== -1) {
      teams.value[index] = { ...team }
    }
  }

  async function deleteTeam() {
    if (teams.value.length <= 1) {
      toast.error('You cannot delete the last team')
      return
    }
    await $fetch(`/api/teams/${team.value.slug}`, {
      method: 'DELETE',
    })

    const deletedTeamId = team.value.id
    teams.value = teams.value.filter(team => team.id !== deletedTeamId)

    if (teams.value.length > 0) {
      await selectTeam(teams.value[0]!)
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
