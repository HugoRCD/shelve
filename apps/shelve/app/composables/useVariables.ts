import type { Variable, CreateVariablesInput } from '@shelve/types'

export function useVariables(refresh: () => Promise<void>, projectId: string) {
  const selectedEnvironment: Ref<Record<string, boolean>> = ref({
    production: true,
    preview: false,
    development: false,
  })
  const environment = computed(() => Object.keys(selectedEnvironment.value).filter(key => selectedEnvironment.value[key]).join('|'))
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
    environment: environment.value,
    variables: [
      {
        index: 1,
        key: '',
        value: '',
      },
    ],
  })

  watch(environment, () => {
    variablesInput.value.environment = environment.value
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
        projectId: +projectId,
        autoUppercase: autoUppercase.value,
        environment: environment.value,
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
    if (variable.environment.length === 0) {
      toast.error('Please select at least one environment')
      updateLoading.value = false
      return
    }
    try {
      await $fetch(`/api/variable/${variable.id}`, {
        method: 'PUT',
        body: {
          projectId: +projectId,
          key: variable.key,
          value: variable.value,
          env: variable.environment,
          autoUppercase: autoUppercase.value,
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
