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
    <UIcon :name="nav_item.icon" class="size-5" />
    <span class="hidden text-sm font-medium text-gray-500 dark:text-gray-400 sm:block">
      {{ capitalize(nav_item.name) }}
    </span>
  </div>
</template>

<style scoped>
.nav-item {
  @apply cursor-pointer rounded-lg px-3 py-2 flex flex-row items-center gap-2 transition-transform duration-200 ease-in-out;
  border: 1px solid transparent;
  transition: border-color 0.2s, background-color 0.2s, box-shadow 0.2s, transform 0.2s;

  span {
    transform: translateY(-1.2px);
  }
}

.nav-item:hover {
  @apply bg-neutral-100 dark:bg-neutral-800;
  @apply border-neutral-200 dark:border-neutral-700;
}

.nav-item.active {
  @apply bg-neutral-100 dark:bg-neutral-800;
  @apply border-neutral-200 dark:border-neutral-700;
  @apply shadow-sm;
  @apply transform scale-105;
}
</style>
