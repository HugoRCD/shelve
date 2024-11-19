import type { Member, Team } from '@shelve/types'
import { TeamRole } from '@shelve/types'

export const useUserTeams = () => {
  return useState<Team[]>('teams')
}

export const useCurrentTeam = () => {
  return useState<Team>('team')
}

export const useTeamId = () => {
  return useState<number>('teamId')
}

export function useTeams() {
  const teams = useUserTeams()
  const currentTeam = useCurrentTeam()
  const teamId = useTeamId()
  const loading = ref(false)
  const createLoading = ref(false)

  async function fetchTeams() {
    loading.value = true
    teams.value = await $fetch<Team[]>('/api/teams', { method: 'GET' })
    if (!teams) throw new Error('Failed to fetch teams')
    currentTeam.value = teams.value.find((team) => team.private) || teams.value[0] as Team
    teamId.value = currentTeam.value.id
    loading.value = false
  }

  async function createTeam(teamName: string) {
    createLoading.value = true
    try {
      const response = await $fetch<Team>('/api/teams', {
        method: 'POST',
        body: {
          name: teamName,
        },
      })
      teams.value.push(response)
      toast.success('Team created')
    } catch (error) {
      toast.error('Failed to create team')
    }
    createLoading.value = false
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

  async function deleteTeam(teamId: number) {
    try {
      teams.value = teams.value.filter((team) => team.id !== teamId)
      await $fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
      })
    } catch (error: any) {
      if (error.statusCode === 401)
        return toast.error('You need to be an admin to delete a team')
    }
  }

  return {
    teams,
    loading,
    createLoading,
    fetchTeams,
    createTeam,
    deleteTeam,
    addMember,
    updateMember,
    removeMember,
  }
}
