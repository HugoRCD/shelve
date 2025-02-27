import type { Member, Team } from '@types'
import { Role, TeamRole } from '@types'

/**
 * Current selected team user role in the team
 * If user is an admin, the role is set to OWNER
 */
export function useTeamRole(): Ref<TeamRole> {
  const currentTeam = useTeam()
  const { user } = useUserSession()
  return computed(() => {
    if (!currentTeam.value) return TeamRole.MEMBER
    if (user.value?.role === Role.ADMIN) return TeamRole.OWNER
    const member = currentTeam.value.members.find(member => member.userId === user.value?.id)
    return member?.role || TeamRole.MEMBER
  })
}

export function useTeamsService() {
  const router = useRouter()
  const teams = useTeams()
  const currentTeam = useTeam()
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

  async function fetchTeam(slug: number) {
    return await $fetch<Team>(`/api/teams/${slug}`, {
      method: 'GET',
    })
  }

  async function selectTeam(team: Team, redirect = true) {
    currentTeam.value = team
    defaultTeamSlug.value = team.slug
    if (redirect) await router.push(`/${currentTeam.value.slug}`)
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
      if (error.statusCode === 409)
        toast.error(error.statusMessage)
      else
        toast.error('Failed to create team')
    } finally {
      createLoading.value = false
      navbarLoading.value = false
    }
  }

  async function updateTeam(input: { name: string, logo: string, slug: string }) {
    try {
      const updatedTeam = await $fetch<Team>(`/api/teams/${currentTeam.value.slug}`, {
        method: 'PUT',
        body: input
      })

      const index = teams.value.findIndex(team => team.id === updatedTeam.id)
      if (index !== -1) {
        teams.value[index] = updatedTeam
      }

      currentTeam.value = updatedTeam
      defaultTeamSlug.value = updatedTeam.slug
      await router.push(`/${updatedTeam.slug}`)
    } catch (error) {
      toast.error('Failed to update team')
    }
  }

  async function addMember(email: string, role: TeamRole) {
    try {
      const newMember = await $fetch<Member>(`/api/teams/${currentTeam.value.slug}/members`, {
        method: 'POST',
        body: {
          email,
          role,
        },
      })

      const existingMember = currentTeam.value.members.find(member => member.userId === newMember.userId)
      if (!existingMember) {
        currentTeam.value.members.push(newMember)
      }

      updateTeamInList(currentTeam.value)

      toast.success('Member added successfully')
    } catch (error) {
      toast.error('Failed to add member')
    }
  }

  async function updateMember(memberId: number, role: TeamRole) {
    try {
      const updatedMember = await $fetch<Member>(`/api/teams/${currentTeam.value.slug}/members/${memberId}`, {
        method: 'PUT',
        body: { role },
      })

      const index = currentTeam.value.members.findIndex(member => member.id === memberId)
      if (index !== -1) {
        currentTeam.value.members[index] = updatedMember
      }

      updateTeamInList(currentTeam.value)

      toast.success('Member updated successfully')
    } catch (error) {
      toast.error('Failed to update member')
    }
  }

  async function removeMember(memberId: number) {
    try {
      await $fetch<Member>(`/api/teams/${currentTeam.value.slug}/members/${memberId}`, {
        method: 'DELETE',
      })

      currentTeam.value.members = currentTeam.value.members.filter(member => member.id !== memberId)

      updateTeamInList(currentTeam.value)

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
    await $fetch(`/api/teams/${currentTeam.value.slug}`, {
      method: 'DELETE',
    })

    const deletedTeamId = currentTeam.value.id
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
