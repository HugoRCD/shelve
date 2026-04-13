import { parseEnvFile } from '@utils'
import { useDropZone } from '@vueuse/core'

export function useFileHandling(updateVariables: (vars: Array<{ index: number, key: string, value: string }>) => void) {
  const dropZoneRef = ref<HTMLElement>()
  const fileInputRef = ref<HTMLInputElement>()

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

  function handleFileContent(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      processEnvContent(content)
    }
    reader.onerror = (e) => console.error('Error reading file:', e)
    reader.readAsText(file)
  }

  function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) handleFileContent(file)
  }

  function onDrop(files: File[] | null) {
    if (files?.[0]) handleFileContent(files[0])
  }

  const { isOverDropZone } = useDropZone(dropZoneRef, { onDrop })

  const border = computed(() =>
    isOverDropZone.value
      ? 'border border-primary border-dashed'
      : 'border border-default'
  )

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
    dropZoneRef,
    isOverDropZone,
    fileInputRef,
    border,
    handleFileUpload,
    triggerFileInput,
  }
}
