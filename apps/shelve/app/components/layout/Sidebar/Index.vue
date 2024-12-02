<script setup lang="ts">
const { mobile = false } = defineProps<{
  mobile?: boolean
}>()
</script>

<template>
  <div class="h-full">
    <UDrawer v-if="mobile">
      <UButton icon="lucide:menu" size="md" class="flex sm:hidden" variant="soft" />
      <template #content>
        <LayoutSidebarContent />
      </template>
    </UDrawer>
    <LayoutSidebarContent v-else class="hidden sm:flex" />
  </div>
</template>

<style>
/* Bezier effect */

.bezier-move,
.bezier-enter-active,
.bezier-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.bezier-enter-from,
.bezier-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

.bezier-leave-active {
  position: absolute;
}
</style>
