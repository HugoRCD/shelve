<script setup lang="ts">
import { capitalize } from 'vue'

type NavItemProps = {
  navItem: Navigation
  active: boolean
}

const { navItem, active = false } = defineProps<NavItemProps>()
</script>

<template>
  <div class="nav-item select-none" :class="{ active }" @click="$router.push(navItem.path)">
    <UIcon :name="navItem.icon" class="font-medium" />
    <span class="text-sm">
      {{ capitalize(navItem.name) }}
    </span>
  </div>
</template>

<style scoped>
@import "tailwindcss";

.nav-item {
  @apply cursor-pointer rounded-lg px-3 py-1.5 flex flex-row items-center gap-2 transition-transform duration-200 ease-in-out;
}

.nav-item:hover {
  @apply bg-neutral-100 text-white dark:bg-neutral-800;
  @apply border-neutral-200 dark:border-neutral-700;
}

.nav-item.active {
  @apply bg-neutral-100 text-white dark:bg-neutral-800;
  @apply border-neutral-200 dark:border-neutral-700;
  @apply shadow-sm;
}
</style>
