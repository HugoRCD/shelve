import type { CreateVariablesInput, Variable } from '@types'

function removeDuplicateKeyValues(variables: Array<{ key: string, value: string, index?: number }>) {
  const seen = new Set()
  return variables.filter(variable => {
    const keyValue = `${variable.key}-${variable.value}`
    if (seen.has(keyValue)) {
      return false
    }
    seen.add(keyValue)
    return true
  })
}

export function useSelectedVariables(projectId: string): Ref<Variable[]> {
  return useState<Variable[]>(`selected-variables-${projectId}`, () => [])
}

export function useVariablesService() {
  const route = useRoute()
  const projectId = route.params.projectId as string
  const teamSlug = route.params.teamSlug as string
  const loading = ref(false)
  const createLoading = ref(false)
  const updateLoading = ref(false)
  const deleteLoading = ref(false)

  async function fetchVariables() {
    const variables = useVariables(projectId)
    loading.value = true
    try {
      variables.value = await $fetch<Variable[]>(`/api/teams/${teamSlug}/projects/${projectId}/variables`)
    } catch (error) {
      console.error(error)
      toast.error('Failed to fetch variables')
    }
    loading.value = false
  }

  async function createVariables(input: CreateVariablesInput) {
    createLoading.value = true
    try {
      const uniqueVariables = removeDuplicateKeyValues(input.variables)
      const uniqueInput = {
        ...input,
        variables: uniqueVariables
      }

      await $fetch(`/api/teams/${teamSlug}/projects/${projectId}/variables`, {
        method: 'POST',
        body: uniqueInput
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
      await $fetch(`/api/teams/${teamSlug}/projects/${projectId}/variables/${variable.id}`, {
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
      await $fetch(`/api/teams/${teamSlug}/projects/${projectId}/variables/${id}`, {
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
    try {
      await $fetch(`/api/teams/${teamSlug}/projects/${projectId}/variables`, {
        method: 'DELETE',
        body: { variables: ids }
      })
      await fetchVariables()
    } catch (error) {
      console.log(error)
    }
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
