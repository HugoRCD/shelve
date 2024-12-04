import type { Environment } from '@shelve/types'

/**
 * Current selected team environments
 */
export function useEnvironments(): Ref<Environment[]> {
  return useState<Environment[]>('environments', () => [])
}

export function useEnvironmentsService() {
  const environments = useEnvironments()
  const teamId = useTeamId()
  const loading = ref(false)
  const createLoading = ref(false)
  const updateLoading = ref(false)
  const deleteLoading = ref(false)

  async function fetchEnvironments() {
    loading.value = true
    try {
      environments.value = await $fetch<Environment[]>(`/api/teams/${teamId.value}/environments`)
    } catch (error) {
      toast.error('Failed to fetch environments')
    }
    loading.value = false
  }

  async function createEnvironment(name: string) {
    if (!name) {
      toast.error('Environment name is required')
      return
    }
    if (environments.value?.find(env => env.name === name)) {
      toast.error('Environment name already exists')
      return
    }
    createLoading.value = true
    try {
      await $fetch(`/api/teams/${teamId.value}/environments`, {
        method: 'POST',
        body: {
          name
        },
      })
    } catch (error) {
      toast.error('Failed to create environment')
    }
    createLoading.value = false
  }

  async function updateEnvironment(environment: Environment) {
    if (!environment.name) {
      toast.error('Environment name is required')
      return
    }
    updateLoading.value = true
    try {
      await $fetch(`/api/teams/${teamId.value}/environments/${environment.id}`, {
        method: 'PUT',
        body: {
          name: environment.name
        },
      })
    } catch (error) {
      toast.error('Failed to update environment')
    }
    updateLoading.value = false
  }

  async function deleteEnvironment(environment: Environment) {
    deleteLoading.value = true
    try {
      await $fetch(`/api/teams/${teamId.value}/environments/${environment.id}`, {
        method: 'DELETE',
      })
    } catch (error) {
      toast.error('Failed to delete environment')
    }
    deleteLoading.value = false
  }

  return {
    environments,
    loading,
    createLoading,
    updateLoading,
    deleteLoading,
    fetchEnvironments,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
  }
}
