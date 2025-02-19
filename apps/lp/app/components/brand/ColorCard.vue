<script setup lang="ts">
defineProps<{
  name: string
  value: string
  usage: string
}>()
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      :style="{ backgroundColor: value }"
      class="rounded-md aspect-video border border-solid border-(--ui-border)/50"
    />
    <div class="flex flex-col">
      <span class="font-bold">{{ name }}</span>
      <span class="text-sm text-(--ui-text-muted)">{{ value }}</span>
      <span class="text-sm text-(--ui-text-muted)">{{ usage }}</span>
    </div>
  </div>
</template>
