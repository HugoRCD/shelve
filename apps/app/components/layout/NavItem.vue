<script setup lang="ts">
import { capitalize, type PropType } from 'vue'
import type { Navigation } from '~/utils/navigation'

defineProps({
  navItem: {
    type: Object as PropType<Navigation>,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="nav-item select-none" :class="{ active }" @click="$router.push(navItem.to)">
    <span :class="`${navItem.icon}`" class="font-medium" />
    <span class="text-sm font-medium">
      {{ capitalize(navItem.name) }}
    </span>
  </div>
</template>

<style scoped>
.nav-item {
  @apply cursor-pointer rounded-lg px-3 py-1.5 flex flex-row items-center gap-2 transition-transform duration-200 ease-in-out;
}

.nav-item:hover {
  @apply bg-neutral-100 dark:bg-neutral-800;
  @apply border-neutral-200 dark:border-neutral-700;
}

.nav-item.active {
  @apply bg-neutral-100 dark:bg-neutral-800;
  @apply border-neutral-200 dark:border-neutral-700;
  @apply shadow-sm;
}
</style>
