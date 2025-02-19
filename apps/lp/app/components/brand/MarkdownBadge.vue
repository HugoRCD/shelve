<script setup lang="ts">
defineProps<{
  name: string
  value: string
  usage: string
  markdown: any
}>()
</script>

<template>
  <div class="space-y-4 p-6 rounded-md border border-(--ui-border)/50">
    <div class="space-y-2">
      <h4 class="font-medium">
        {{ name }}
      </h4>
      <p class="text-sm text-(--ui-text-muted)">
        {{ usage }}
      </p>
    </div>
    <img :src="value" :alt="`Shelve ${name} badge`" class="h-10">
    <div class="space-y-2">
      <span class="text-sm text-(--ui-text-muted)">Markdown</span>
      <MDC :value="markdown" />
    </div>
  </div>
</template>
