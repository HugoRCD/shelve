<script setup lang="ts">
defineProps<{
  name: string
  value: string
  usage: string
  markdown: any
}>()
</script>

<template>
  <BrandCopy :content="markdown" copy-label="Copy badge">
    <div class="space-y-4 p-6 rounded-md border border-(--ui-border)/50">
      <div class="space-y-2">
        <h4 class="font-medium">
          {{ name }}
        </h4>
        <p class="text-sm text-(--ui-text-muted)">
          {{ usage }}
        </p>
      </div>
      <img :src="value" :alt="`Shelve ${name} badge`" class="h-12">
    </div>
  </BrandCopy>
</template>
