import type { Member, Team } from '@shelve/types'
import { TeamRole } from '@shelve/types'

export const useUserTeams = () => {
  return useState<Team[]>('teams')
}

export const useDefaultTeam = () => {
  return useState<Team>('defaultTeam')
}

export function useTeams() {
  const teams = useUserTeams()
  const defaultTeam = useDefaultTeam()
  const loading = ref(false)
  const createLoading = ref(false)

  async function fetchTeams() {
    loading.value = true
    teams.value = await $fetch<Team[]>('/api/teams', {
      method: 'GET',
    })
    if (!teams) throw new Error('Failed to fetch teams')
    defaultTeam.value = teams.value.find((team) => team.private) || teams.value[0] as Team
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
    try {
      const teamId = defaultTeam.value.id
      const _member = await $fetch<Member>(`/api/teams/${teamId}/members`, {
        method: 'POST',
        body: {
          email,
          role,
        },
      })
      const index = teams.value.findIndex((team) => team.id === teamId)
      const team = teams.value[index]
      if (!team)
        return toast.error('Failed to add member')
      const memberIndex = team.members.findIndex((member) => member.id === _member.id)
      if (memberIndex !== -1)
        team.members[memberIndex] = _member
      else
        team.members.push(_member)
      teams.value.splice(index, 1, team)
      toast.success('Member added')
    } catch (error: any) {
      if (error.statusCode === 401)
        return toast.error('You need to be an admin to add a member')
      toast.error('Failed to add member')
    }
  }

  async function updateMember(memberId: number, role: TeamRole) {
    try {
      const teamId = defaultTeam.value.id
      const _member = await $fetch<Member>(`/api/teams/${teamId}/members/${memberId}`, {
        method: 'PUT',
        body: {
          role,
        },
      })
      const team = defaultTeam.value
      if (!team)
        return toast.error('Failed to update member')
      const memberIndex = team.members.findIndex((member) => member.id === memberId)
      if (memberIndex !== -1)
        team.members.splice(memberIndex, 1, _member)
      defaultTeam.value = team
      toast.success('Member updated')
    } catch (error: any) {
      if (error.statusCode === 401)
        return toast.error('You need to be an admin to update a member')
      toast.error('Failed to update member')
    }
  }

  async function removeMember(memberId: number) {
    try {
      const teamId = defaultTeam.value.id
      await $fetch<Member>(`/api/teams/${teamId}/members/${memberId}`, {
        method: 'DELETE',
      })
      const index = teams.value.findIndex((team) => team.id === teamId)
      const team = teams.value[index]
      if (!team)
        return toast.error('Failed to remove member')
      const memberIndex = team.members.findIndex((member) => member.id === memberId)
      if (memberIndex !== -1) {
        team.members.splice(memberIndex, 1)
      }
      teams.value.splice(index, 1, team)
      toast.success('Member removed')
    } catch (error: any) {
      if (error.statusCode === 401)
        return toast.error('You need to be an admin to remove a member')
      toast.error('Failed to remove member')
    }
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
