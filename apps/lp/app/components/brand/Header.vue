<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <div class="flex flex-col gap-2">
    <span class="text-lg font-bold">{{ title }}</span>
    <span class="text-muted">{{ description }}</span>
  </div>
</template>
