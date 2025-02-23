import { parseEnvFile } from '@utils'

export function useFileHandling(updateVariables: (vars: Array<{ index: number, key: string, value: string }>) => void) {
  const dragOver = ref(false)
  const fileInputRef = ref<HTMLInputElement | null>(null)

  const border = computed(() => {
    return dragOver.value
      ? 'border-[0.5px] border-(--ui-primary) border-dashed'
      : 'border-[0.5px] border-(--ui-border)'
  })

  function processEnvContent(content: string) {
    try {
      const variables = parseEnvFile(content, true).map((v, index) => ({
        index: index + 1,
        key: v.key,
        value: v.value
      }))
      updateVariables(variables)
    } catch (error) {
      toast.error('Invalid .env content')
    }
  }

  function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files ? target.files[0] : null
    if (file) {
      handleFileContent(file)
    }
  }

  function handleFileContent(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      processEnvContent(content)
    }
    reader.onerror = (e) => console.error('Error reading file:', e)
    reader.readAsText(file)
  }

  const dragHandlers = {
    handleDragEnter: (event: DragEvent) => {
      event.preventDefault()
      dragOver.value = true
    },
    handleDragOver: (event: DragEvent) => {
      event.preventDefault()
    },
    handleDragLeave: (event: DragEvent): void => {
      const currentTarget = event.currentTarget as Node
      const relatedTarget = event.relatedTarget as Node | null
      if (!currentTarget?.contains(relatedTarget)) {
        dragOver.value = false
      }
    },
    handleDrop: (event: DragEvent): void => {
      event.preventDefault()
      dragOver.value = false
      const files = event.dataTransfer?.files
      if (files?.length && files[0]) {
        handleFileContent(files[0])
      }
    }
  }

  onMounted(() => {
    document.addEventListener('paste', (e) => {
      const { clipboardData } = e
      if (!clipboardData) return
      const content = clipboardData.getData('text')
      const target = e.target as HTMLElement
      if (!target?.closest('#varCreation') || !content.includes('=')) return
      e.preventDefault()
      processEnvContent(content)
    })
  })

  const triggerFileInput = () => fileInputRef.value?.click()

  return {
    dragOver,
    fileInputRef,
    border,
    handleFileContent,
    handleFileUpload,
    dragHandlers,
    triggerFileInput,
  }
}
