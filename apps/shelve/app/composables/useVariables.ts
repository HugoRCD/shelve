import type { CreateVariablesInput, Variable } from '@shelve/types'

/**
 * Current project variables
 */
export function useVariables(): Ref<Variable[]> {
  const projectId = useProjectId()
  return useState<Variable[]>(`variables-${projectId.value}`)
}

export function useVariablesService() {
  const projectId = useProjectId()
  const variables = useVariables()
  const team = useTeam()
  const baseUrl = computed(() => `/api/teams/${team.value.id}/projects/${projectId.value}/variables`)

  const loading = ref(false)
  const createLoading = ref(false)
  const updateLoading = ref(false)
  const deleteLoading = ref(false)

  async function fetchVariables() {
    loading.value = true
    try {
      variables.value = await $fetch<Variable[]>(baseUrl.value)
    } catch (error) {
      toast.error('Failed to fetch variables')
    }
    loading.value = false
  }

  async function createVariables(input: CreateVariablesInput) {
    createLoading.value = true
    try {
      await $fetch(baseUrl.value, {
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
      await $fetch(`${baseUrl.value}/${variable.id}`, {
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
      await $fetch(`${baseUrl.value}/${id}`, {
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
    await $fetch(baseUrl.value, {
      method: 'DELETE',
      body: { variables: ids }
    })
    await fetchVariables()
  }

  return {
    variables,
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
