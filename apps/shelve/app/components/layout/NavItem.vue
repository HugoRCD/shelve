<script setup lang="ts">
import { capitalize } from 'vue'

type NavItemProps = {
  navItem: Navigation
  active: boolean
}

const { navItem, active = false } = defineProps<NavItemProps>()
</script>

<template>
  <div class="nav-item select-none" :class="{ active }" :data-active="active" @click="$router.push(navItem.path)">
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
  @apply border border-transparent hover:border-(--ui-border) data-[active=true]:border-(--ui-border);
  @apply bg-transparent hover:bg-(--ui-bg-muted) data-[active=true]:bg-(--ui-bg-accented)/50;
}
</style>
