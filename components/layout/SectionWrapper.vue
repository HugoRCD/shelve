<script setup lang="ts">
import type { Navigation } from "~/utils/navigation";
import type { PropType } from "vue";

defineProps({
  navigation: {
    type: Object as PropType<Navigation>,
    required: true,
  },
});
</script>

<template>
  <div class="main-container flex flex-1 flex-col overflow-hidden border border-neutral-200 dark:border-neutral-800">
    <div class="flex justify-between gap-1 border-b border-inherit px-5 py-2">
      <div class="flex items-center gap-2">
        <Transition name="slide-to-bottom" mode="out-in">
          <UIcon :key="navigation.icon" :name="navigation.icon" class="size-5" />
        </Transition>
        <Transition name="slide-to-top" mode="out-in">
          <h1 :key="navigation.title" class="text-lg font-bold">
            {{ navigation.title }}
          </h1>
        </Transition>
      </div>
      <DropdownMenu />
    </div>
    <div class="mt-6 flex h-full flex-col gap-4 overflow-y-auto px-3 sm:px-6">
      <slot />
    </div>
  </div>
</template>

<style scoped>

</style>
