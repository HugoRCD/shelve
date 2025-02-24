<script setup lang="ts">
import type { Navigation } from '@types'

const route = useRoute()

defineProps<{
  nav: Navigation
}>()
</script>

<template>
  <ULink
    v-bind="nav"
    exact
  >
    <UTooltip :text="nav.name" :content="{ side: 'top' }">
      <div class="highlight-wrapper" :data-active="nav.to === route.path">
        <div class="nav-item" :data-active="nav.to === route.path">
          <UIcon :name="nav.icon" class="icon" />
        </div>
      </div>
    </UTooltip>
  </ULink>
</template>

<style scoped>
@import "tailwindcss";

.highlight-wrapper {
  @apply h-fit active:translate-y-[1px] w-fit rounded-full p-[1px] transition-all duration-200 hover:opacity-90;
  @apply data-[active=true]:bg-gradient-to-br from-(--ui-bg-inverted) from-[3%] via-(--ui-bg-elevated) via-30% to-(--ui-bg);
}

.nav-item {
  /* Structural */
  @apply rounded-full p-2 flex items-center justify-center;

  /* Active */
  @apply data-[active=true]:bg-(--ui-bg-elevated) data-[active=true]:shadow-md bg-transparent;
  @apply border border-transparent data-[active=true]:border-(--ui-border);

  /* Hover */
  @apply hover:bg-(--ui-bg-elevated) hover:shadow-md;

  .icon {
    @apply text-xl text-(--ui-text-muted);
  }
}
</style>
