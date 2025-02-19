<script setup lang="ts">
const props = defineProps<{
  copyLabel?: string
  content: string
  link?: string
  assets?: {
    svg?: string
    png?: string
  }
}>()

const svgContent = ref('')

onMounted(async () => {
  if (props.assets?.svg) {
    try {
      const response = await fetch(props.assets.svg)
      svgContent.value = await response.text()
    } catch (error) {
      console.error('Failed to load SVG content')
    }
  }
})

const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(downloadUrl)
    toast.success('Download started')
  } catch (error) {
    toast.error('Download failed')
  }
}

const items = computed(() => {
  const baseItems = [
    {
      label: 'Actions',
      type: 'label' as const
    },
    {
      label: props.copyLabel ?? 'Copy',
      icon: 'lucide:copy',
      onSelect: () => {
        const contentToCopy = svgContent.value || props.content
        navigator.clipboard.writeText(contentToCopy)
        toast.success('Copied to clipboard')
      }
    }
  ]

  if (props.assets?.svg) {
    baseItems.push({
      label: 'Download SVG',
      icon: 'lucide:file',
      onSelect: () => downloadFile(props.assets!.svg!, 'logo.svg')
    })
  }

  if (props.assets?.png) {
    baseItems.push({
      label: 'Download PNG',
      icon: 'lucide:image',
      onSelect: () => downloadFile(props.assets!.png!, 'logo.png')
    })
  }

  return baseItems
})
</script>

<template>
  <UContextMenu :items>
    <div class="cursor-context-menu">
      <slot />
    </div>
  </UContextMenu>
</template>
