<script setup lang="ts">
import type { Navigation } from "~/utils/navigation";
import { capitalize, type PropType } from "vue";

defineProps({
  nav_item: {
    type: Object as PropType<Navigation>,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div class="nav-item select-none" :class="{ active }" @click="$router.push(nav_item.to)">
    <span :class="`${nav_item.icon}`" class="font-medium" />
    <span class="text-sm font-medium">
      {{ capitalize(nav_item.name) }}
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
