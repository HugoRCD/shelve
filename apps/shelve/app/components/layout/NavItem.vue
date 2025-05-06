<script setup lang="ts">
import type { Navigation } from '@types'
import { capitalize } from 'vue'

type NavItemProps = {
  navItem: Navigation
  active: boolean
}

const { navItem, active = false } = defineProps<NavItemProps>()
</script>

<template>
  <div class="nav-item select-none" :class="{ active }" :data-active="active" @click="$router.push(navItem.to)">
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
  @apply border border-transparent hover:border-default data-[active=true]:border-default;
  @apply bg-transparent hover:bg-muted data-[active=true]:bg-accented/50;
}
</style>
