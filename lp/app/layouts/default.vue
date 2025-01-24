<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

const { y } = useWindowScroll()
const documentHeight = ref(0)

const scrollPercent = computed(() => {
  if (documentHeight.value === 0) return 0
  const scrollable = documentHeight.value - window.innerHeight
  return Math.min(Math.max(y.value / scrollable, 0), 1)
})

const updateDocumentHeight = () => {
  documentHeight.value = document.documentElement.scrollHeight
}

onMounted(() => {
  updateDocumentHeight()
  window.addEventListener('resize', updateDocumentHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDocumentHeight)
})
</script>

<template>
  <div class="default relative flex h-screen flex-col">
    <LayoutNavbar :scroll="scrollPercent" />
    <div class="flex-1">
      <slot />
    </div>
    <LayoutFooter />
  </div>
</template>
