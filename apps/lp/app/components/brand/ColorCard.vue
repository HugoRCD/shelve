<script setup lang="ts">
defineProps<{
  name: string
  value: string
  usage: string
}>()
</script>

<template>
  <BrandCopy :content="value" :copy-label="`Copy ${name} color`">
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
  </BrandCopy>
</template>
