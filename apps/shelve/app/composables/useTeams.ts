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

  const lastUsedTeamId = useCookie<number>('lastUsedTeam', {
    watch: true,
  })

  async function fetchTeams() {
    loading.value = true

    try {
      const fetchedTeams = await $fetch<Team[]>('/api/teams', { method: 'GET' })

      if (!fetchedTeams) throw new Error('Failed to fetch teams')

      teams.value = fetchedTeams

      const privateTeam = teams.value.find(team => team.private)
      const defaultTeamId = privateTeam ? privateTeam.id : teams.value[0]?.id as number

      lastUsedTeamId.value = lastUsedTeamId.value || defaultTeamId
      currentTeam.value = teams.value.find(team => team.id === lastUsedTeamId.value) as Team
      teamId.value = lastUsedTeamId.value
    } finally {
      loading.value = false
    }
  }

  async function selectTeam(id: number) {
    teamId.value = id
    await useProjects().fetchProjects()
    currentTeam.value = teams.value.find(team => team.id === id) as Team
    lastUsedTeamId.value = id
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
