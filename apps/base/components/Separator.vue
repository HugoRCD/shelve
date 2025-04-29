<script setup lang="ts">
const { orientation = 'horizontal' } = defineProps<{
  orientation?: 'horizontal' | 'vertical'
}>()
</script>

<template>
  <div v-if="orientation === 'horizontal'">
    <USeparator :ui="{ border: 'border-[1px] border-default' }" />
    <USeparator :ui="{ border: 'border-[1px] border-elevated' }" />
  </div>
  <div v-else class="flex h-full">
    <USeparator orientation="vertical" class="h-auto" :ui="{ border: 'border-[4px] border-default' }" />
    <USeparator orientation="vertical" class="h-auto" :ui="{ border: 'border-[4px] border-elevated' }" />
  </div>
</template>
