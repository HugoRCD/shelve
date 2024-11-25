import type { Variable, CreateVariablesInput } from '@shelve/types'

export function useVariables(refresh: () => Promise<void>, projectId: string) {
  const teamEnv = useTeamEnv()

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

  const createLoading = ref(false)
  const updateLoading = ref(false)
  const deleteLoading = ref(false)

  const variablesToCreate = ref(1)

  const variablesInput = ref<CreateVariablesInput>({
    autoUppercase: autoUppercase.value,
    projectId: +projectId,
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
        projectId: +projectId,
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
    await refresh()
  }

  async function updateVariable(variable: Variable) {
    updateLoading.value = true
    try {
      await $fetch(`/api/variables/${variable.id}`, {
        method: 'PUT',
        body: variable
      })
      toast.success('Variable updated successfully')
      await refresh()
    } catch (error) {
      console.error(error)
      toast.error('Failed to update variable')
    }
    updateLoading.value = false
  }

  async function deleteVariable(id: number) {
    deleteLoading.value = true
    try {
      await $fetch(`/api/variables/${id}`, {
        method: 'DELETE',
      })
      toast.success('Your variable has been deleted')
    } catch (error) {
      toast.error('An error occurred')
    }
    deleteLoading.value = false
    await refresh()
  }

  return {
    createLoading,
    updateLoading,
    deleteLoading,
    selectedEnvironments,
    variablesInput,
    variablesToCreate,
    addVariable,
    removeVariable,
    createVariables,
    updateVariable,
    deleteVariable
  }
}
