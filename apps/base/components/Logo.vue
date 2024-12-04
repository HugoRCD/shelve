<script setup lang="ts">
const { size = 'size-5', text = true, textSize = 'text-base' } = defineProps<{
  size?: string
  text?: boolean
  textSize?: string
}>()
</script>

<template>
  <div class="flex items-center gap-2">
    <UIcon name="custom:shelve" :class="size" />
    <NuxtLink v-if="text" to="/" aria-label="Shelve" class="font-semibold" :class="textSize">
      Shelve
    </NuxtLink>
  </div>
</template>
