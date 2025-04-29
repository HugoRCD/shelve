<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const props = defineProps<{
  surround: ContentNavigationItem[]
}>()

const prev = computed(() => props.surround[0])
const next = computed(() => props.surround[1])
</script>

<template>
  <div class="bg-muted p-1 rounded-lg flex items-center justify-between w-full gap-2">
    <div v-if="prev" :class="next ? 'relative group flex items-center gap-1 text-muted sm:p-3 hover:text-highlighted' : 'overflow-hidden relative group flex items-center gap-2 w-full bg-default/90 p-3 rounded-md hover:ring-2 ring-default'">
      <NuxtLink :to="prev.path" class="absolute inset-0 z-10" />
      <div class="flex items-center gap-1 text-muted group-hover:text-highlighted">
        <UIcon name="lucide:chevron-left" />
        <span class="text-sm">
          Previous
        </span>
      </div>
      <USeparator v-if="!next" orientation="vertical" class="w-2 h-[24px]" />
      <div v-if="!next" class="flex flex-col truncate">
        <p class="font-medium main-gradient brightness-150 text-sm">
          {{ prev.title }}
        </p>
        <p class="max-sm:hidden text-muted line-clamp-1 text-sm">
          {{ prev.description }}
        </p>
      </div>
    </div>
    <div v-if="next" class="overflow-hidden relative group flex items-center gap-2 w-full justify-end bg-default/90 p-3 rounded-md hover:ring-2 ring-default">
      <NuxtLink :to="next.path" class="absolute inset-0 z-10" />
      <div class="flex flex-col text-right truncate">
        <p class="font-medium main-gradient brightness-150 text-sm">
          {{ next.title }}
        </p>
        <p class="max-sm:hidden text-muted line-clamp-1 text-sm">
          {{ next.description }}
        </p>
      </div>
      <USeparator orientation="vertical" class="w-2 h-[24px]" />
      <div class="flex items-center gap-1 text-muted group-hover:text-highlighted">
        <span class="text-sm">
          Next
        </span>
        <UIcon name="lucide:chevron-right" />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
