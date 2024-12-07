import type { CreateVariablesInput, Variable } from '@shelve/types'

/**
 * Current project variables
 */
export function useVariables(projectId: number) {
  return useState<Variable[]>(`variables-${projectId}`)
}

export function useVariablesService() {
  const route = useRoute()
  const projectId = route.params.projectId as string
  const teamId = useCookie<number>('defaultTeamId')
  const loading = ref(false)
  const createLoading = ref(false)
  const updateLoading = ref(false)
  const deleteLoading = ref(false)

  async function fetchVariables() {
    const variables = useVariables(+projectId!)
    loading.value = true
    try {
      variables.value = await $fetch<Variable[]>(`/api/teams/${teamId.value}/projects/${projectId}/variables`)
    } catch (error) {
      console.error(error)
      toast.error('Failed to fetch variables')
    }
    loading.value = false
  }

  async function createVariables(input: CreateVariablesInput) {
    createLoading.value = true
    try {
      await $fetch(`/api/teams/${teamId.value}/projects/${projectId}/variables`, {
        method: 'POST',
        body: input
      })
      toast.success('Your variables have been created')
    } catch (error) {
      toast.error('An error occurred')
    }
    createLoading.value = false
    await fetchVariables()
  }

  async function updateVariable(variable: Variable) {
    updateLoading.value = true
    try {
      await $fetch(`/api/teams/${teamId.value}/projects/${projectId}/variables/${variable.id}`, {
        method: 'PUT',
        body: variable
      })
      toast.success('Variable updated successfully')
      await fetchVariables()
    } catch (error) {
      console.error(error)
      toast.error('Failed to update variable')
    }
    updateLoading.value = false
  }

  async function deleteVariable(id: number, showToast: boolean = true) {
    deleteLoading.value = true
    try {
      await $fetch(`/api/teams/${teamId.value}/projects/${projectId}/variables/${id}`, {
        method: 'DELETE',
      })
      if (showToast) toast.success('Variable deleted successfully')
    } catch (error) {
      if (showToast) toast.error('Failed to delete variable')
    }
    deleteLoading.value = false
    await fetchVariables()
  }

  async function deleteVariables(ids: number[]) {
    await $fetch(`/api/teams/${teamId.value}/projects/${projectId}/variables`, {
      method: 'DELETE',
      body: { variables: ids }
    })
    await fetchVariables()
  }

  return {
    loading,
    createLoading,
    updateLoading,
    deleteLoading,
    fetchVariables,
    createVariables,
    updateVariable,
    deleteVariable,
    deleteVariables,
  }
}
