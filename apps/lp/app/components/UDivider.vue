<script setup lang="ts">
type DividerProps = {
  orientation?: 'horizontal' | 'vertical'
}

const { orientation = 'horizontal' } = defineProps<DividerProps>()
</script>

<template>
  <div v-if="orientation === 'horizontal'" class="flex-1 border-b border-neutral-200 dark:border-neutral-800" />
  <div v-else class="flex-1 border-r border-neutral-200 dark:border-neutral-800" />
</template>
