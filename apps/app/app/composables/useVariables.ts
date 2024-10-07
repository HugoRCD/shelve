import type { Variable, VariablesCreateInput } from '@shelve/types'

export function useVariables(refresh: () => Promise<void>, projectId: string) {
  const selectedEnvironment = ref(['production'])
  const environment = computed(() => selectedEnvironment.value.join('|'))

  const createLoading = ref(false)
  const updateLoading = ref(false)
  const deleteLoading = ref(false)

  const dragOver = ref(false)

  const border = computed(() => {
    if (dragOver.value) {
      return 'border-[0.5px] border-primary border-dashed'
    }
    return 'border-[0.5px] border-gray-200 dark:border-gray-800'
  })

  const background = computed(() => {
    if (dragOver.value) {
      return 'rgba(255, 255, 255, 0.2)' // Utilisation de rgba pour la transparence
    }
    return 'rgba(255, 255, 255, 1)' // Fond opaque
  })


  const variablesToCreate = ref(1)

  const variablesInput = ref<VariablesCreateInput>({
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
    variablesToCreate.value--
    variablesInput.value.variables.splice(index, 1)
  }

  watch(selectedEnvironment, () => {
    variablesInput.value.variables.forEach((variable) => {
      variable.environment = environment.value
    })
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

  const fileInputRef = ref<HTMLInputElement | null>(null)

  const triggerFileInput = () => {
    fileInputRef.value?.click()
  }

  function parseEnvFile(file: File) {
    const reader = new FileReader()

    reader.onload = (e) => {
      const content = e.target?.result as string
      const lines = content.split('\n')
      const filteredLines = lines.filter((line) => !line.startsWith('#'))
      const variables = filteredLines.map((line, index) => {
        const [key, value] = line.split('=')
        if (!key || !value) {
          toast.error('Invalid .env file')
          throw new Error('Invalid .env')
        }
        return {
          index,
          key: key.replace(/[\n\r'"]+/g, ''),
          value: value.replace(/[\n\r'"]+/g, ''),
          projectId: parseInt(projectId),
          environment: environment.value,
        }
      })
      variablesToCreate.value = variables.length
      variablesInput.value.variables = variables
    }

    reader.onerror = (e) => {
      console.error('Erreur de lecture du fichier:', e)
    }

    reader.readAsText(file)
  }

  const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files ? target.files[0] : null
    if (file) {
      parseEnvFile(file)
    }
  }

  function handleDragEnter(event: DragEvent) {
    event.preventDefault()
    dragOver.value = true
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault()
  }

  function handleDragLeave(event: DragEvent) {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      dragOver.value = false
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    dragOver.value = false
    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      parseEnvFile(files[0])
    }
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
    fileInputRef,
    dragOver,
    border,
    background,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    triggerFileInput,
    handleFileUpload,
    addVariable,
    removeVariable,
    createVariables,
    updateVariable,
    deleteVariable
  }
}
