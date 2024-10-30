import type { Variable, VariablesCreateInput } from '@shelve/types'

export function useVariables(refresh: () => Promise<void>, projectId: string) {
  const selectedEnvironment = ref(['production'])
  const environment = computed(() => selectedEnvironment.value.join('|'))
  const autoUppercase = useCookie<boolean>('autoUppercase', {
    watch: true,
    default: () => true,
  })

  const createLoading = ref(false)
  const updateLoading = ref(false)
  const deleteLoading = ref(false)

  const variablesToCreate = ref(1)

  const variablesInput = ref<VariablesCreateInput>({
    autoUppercase: autoUppercase.value,
    projectId: parseInt(projectId),
    variables: [
      {
        index: 1,
        key: '',
        value: '',
        environment: 'production',
        projectId: parseInt(projectId),
      },
    ],
  })

  function addVariable() {
    variablesToCreate.value++
    variablesInput.value.variables.push({
      index: variablesToCreate.value,
      key: '',
      value: '',
      environment: environment.value,
      projectId: parseInt(projectId),
    })
  }

  function removeVariable(index: number) {
    if (variablesToCreate.value === 1) {
      variablesInput.value.variables[index].key = ''
      variablesInput.value.variables[index].value = ''
      return
    }
    variablesToCreate.value--
    variablesInput.value.variables.splice(index, 1)
  }

  watch(selectedEnvironment, () => {
    variablesInput.value.variables.forEach((variable) => {
      variable.environment = environment.value
    })
  })
  watch(autoUppercase, () => {
    variablesInput.value.autoUppercase = autoUppercase.value
  })

  async function createVariables() {
    createLoading.value = true
    if (environment.value.length === 0) {
      toast.error('Please select at least one environment')
      createLoading.value = false
      return
    }
    try {
      await $fetch(`/api/variable`, {
        method: 'POST',
        body: variablesInput.value,
      })
      toast.success('Your variables have been created')
      variablesToCreate.value = 1
      variablesInput.value = {
        projectId: parseInt(projectId),
        variables: [
          {
            index: 1,
            key: '',
            value: '',
            environment: 'production',
            projectId: parseInt(projectId),
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
    if (variable.environment.length === 0) {
      toast.error('Please select at least one environment')
      updateLoading.value = false
      return
    }
    try {
      await $fetch(`/api/variable`, {
        method: 'POST',
        body: {
          projectId: parseInt(projectId),
          variables: [variable]
        },
      })
      toast.success('Your variable has been updated')
    } catch (error) {
      toast.error('An error occurred')
    }
    updateLoading.value = false
    await refresh()
  }

  async function deleteVariable(varId: number, varEnv: string) {
    deleteLoading.value = true
    try {
      await $fetch(`/api/variable/${varId}/${varEnv}`, {
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
    selectedEnvironment,
    environment,
    variablesInput,
    variablesToCreate,
    addVariable,
    removeVariable,
    createVariables,
    updateVariable,
    deleteVariable
  }
}
