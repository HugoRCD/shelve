<script setup lang="ts">
import type { Navigation } from '@types'

const route = useRoute()

defineProps<{
  nav: Navigation
}>()
</script>

<template>
  <ULink v-bind="nav" exact>
    <UTooltip :text="nav.name" :content="{ side: 'top' }">
      <div class="highlight-wrapper rounded-full" :data-active="nav.to === route.path">
        <div class="nav-item" :data-active="nav.to === route.path">
          <UIcon :name="nav.icon" class="icon" />
        </div>
      </div>
    </UTooltip>
  </ULink>
</template>

<style scoped>
@import "tailwindcss";

.nav-item {
  /* Structural */
  @apply rounded-full p-2 flex items-center justify-center;

  /* Active */
  @apply data-[active=true]:bg-(--ui-bg-accented) data-[active=true]:shadow-md bg-transparent;

  /* Hover */
  @apply hover:bg-(--ui-bg-accented) hover:shadow-md;

  .icon {
    @apply sm:text-lg text-(--ui-text-highlighted);
  }
}
</style>
