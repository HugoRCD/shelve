import type { CreateVariablesInput, Variable } from '@shelve/types'

/**
 * Current project variables
 */
export function useVariables(): Ref<Variable[]> {
  return useState<Variable[]>('variables', () => [])
}

export function useVariablesService() {
  const projectId = useProjectId()
  const teamEnv = useEnvironments()
  const variables = useVariables()

  const selectedEnvironments = ref<Record<number, boolean>>(
    Object.fromEntries(
      teamEnv.value.map(env => [
        env.id,
        true
      ])
    )
  )

  const environmentIds = computed(() =>
    Object.entries(selectedEnvironments.value)
      .filter(([_, selected]) => selected)
      .map(([id]) => parseInt(id))
  )

  const autoUppercase = useCookie<boolean>('autoUppercase', {
    watch: true,
    default: () => true,
  })

  const loading = ref(false)
  const createLoading = ref(false)
  const updateLoading = ref(false)
  const deleteLoading = ref(false)

  const variablesToCreate = ref(1)

  const variablesInput = ref<CreateVariablesInput>({
    autoUppercase: autoUppercase.value,
    projectId: +projectId.value,
    environmentIds: environmentIds.value,
    variables: [
      {
        index: 1,
        key: '',
        value: '',
      },
    ],
  })

  watch(environmentIds, () => {
    variablesInput.value.environmentIds = environmentIds.value
  })

  function addVariable() {
    variablesToCreate.value++
    variablesInput.value.variables.push({
      index: variablesToCreate.value,
      key: '',
      value: '',
    })
  }

  function removeVariable(index: number) {
    if (variablesToCreate.value === 1) {
      variablesInput.value.variables[index]!.key = ''
      variablesInput.value.variables[index]!.value = ''
      return
    }
    variablesToCreate.value--
    variablesInput.value.variables.splice(index, 1)
  }

  watch(autoUppercase, () => {
    variablesInput.value.autoUppercase = autoUppercase.value
  })

  async function fetchVariables() {
    loading.value = true
    try {
      variables.value = await $fetch<Variable[]>(`/api/variables/project/${projectId.value}`)
    } catch (error) {
      toast.error('Failed to fetch variables')
    }
    loading.value = false
  }

  async function createVariables() {
    createLoading.value = true
    if (environmentIds.value.length === 0) {
      toast.error('Please select at least one environment')
      createLoading.value = false
      return
    }
    try {
      await $fetch('/api/variables', {
        method: 'POST',
        body: variablesInput.value
      })
      toast.success('Your variables have been created')
      variablesToCreate.value = 1
      variablesInput.value = {
        projectId: +projectId.value,
        autoUppercase: autoUppercase.value,
        environmentIds: environmentIds.value,
        variables: [
          {
            index: 1,
            key: '',
            value: '',
          },
        ],
      }
    } catch (error) {
      toast.error('An error occurred')
    }
    createLoading.value = false
    await fetchVariables()
  }

  async function updateVariable(variable: Variable) {
    updateLoading.value = true
    try {
      await $fetch(`/api/variables/${variable.id}`, {
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
      await $fetch(`/api/variables/${id}`, {
        method: 'DELETE',
      })
      if (showToast) toast.success('Variable deleted successfully')
    } catch (error) {
      if (showToast) toast.error('Failed to delete variable')
    }
    deleteLoading.value = false
    await fetchVariables()
  }

  return {
    variables,
    loading,
    createLoading,
    updateLoading,
    deleteLoading,
    selectedEnvironments,
    variablesInput,
    variablesToCreate,
    fetchVariables,
    addVariable,
    removeVariable,
    createVariables,
    updateVariable,
    deleteVariable
  }
}
