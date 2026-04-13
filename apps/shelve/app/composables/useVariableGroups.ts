import type { VariableGroup } from '@types'

export function useVariableGroupsService() {
  const route = useRoute()
  const projectId = route.params.projectId as string
  const teamSlug = route.params.teamSlug as string
  const loading = ref(false)

  const basePath = `/api/teams/${teamSlug}/projects/${projectId}/variable-groups`

  async function fetchGroups() {
    const groups = useVariableGroups(projectId)
    loading.value = true
    try {
      groups.value = await $fetch<VariableGroup[]>(basePath)
    } catch {
      toast.error('Failed to fetch variable groups')
    }
    loading.value = false
  }

  async function createGroup(name: string, description?: string) {
    try {
      await $fetch(basePath, {
        method: 'POST',
        body: { name, description },
      })
      toast.success('Group created')
      await fetchGroups()
    } catch {
      toast.error('Failed to create group')
    }
  }

  async function updateGroup(id: number, data: { name?: string; description?: string; position?: number }) {
    try {
      await $fetch(`${basePath}/${id}`, {
        method: 'PUT',
        body: data,
      })
      toast.success('Group updated')
      await fetchGroups()
    } catch {
      toast.error('Failed to update group')
    }
  }

  async function deleteGroup(id: number) {
    try {
      await $fetch(`${basePath}/${id}`, {
        method: 'DELETE',
      })
      toast.success('Group deleted')
      await fetchGroups()
    } catch {
      toast.error('Failed to delete group')
    }
  }

  return {
    loading,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
  }
}
