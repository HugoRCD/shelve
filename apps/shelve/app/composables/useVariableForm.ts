import type { CreateVariablesInput, Environment } from '@types'

export function useVariableForm(projectId: number, teamEnv: Environment[]) {
  const autoUppercase = useCookie<boolean>('autoUppercase', {
    watch: true,
    default: () => true,
  })

  const syncWithGitHub = useCookie<boolean>('syncWithGitHub', {
    watch: true,
    default: () => false,
  })

  const syncWithVercel = useCookie<boolean>('syncWithVercel', {
    default: () => false,
  })

  const variablesToCreate = ref(1)
  const selectedEnvironments = ref<Record<number, boolean>>(
    Object.fromEntries(
      teamEnv.map(env => [env.id, true])
    )
  )

  const environmentIds = computed(() =>
    Object.entries(selectedEnvironments.value)
      .filter(([_, selected]) => selected)
      .map(([id]) => parseInt(id))
  )

  const variablesInput = ref<CreateVariablesInput>({
    autoUppercase: autoUppercase.value,
    projectId,
    environmentIds: environmentIds.value,
    variables: [{ index: 1, key: '', value: '' }],
  })

  watch(autoUppercase, () => {
    variablesInput.value.autoUppercase = autoUppercase.value
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

  function resetForm() {
    variablesToCreate.value = 1
    variablesInput.value = {
      autoUppercase: autoUppercase.value,
      projectId,
      environmentIds: environmentIds.value,
      variables: [{ index: 1, key: '', value: '' }],
    }
  }

  return {
    variablesInput,
    variablesToCreate,
    selectedEnvironments,
    environmentIds,
    autoUppercase,
    syncWithGitHub,
    syncWithVercel,
    addVariable,
    removeVariable,
    resetForm,
  }
}
