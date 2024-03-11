<script setup lang="ts">
import type { PropType } from "vue";

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String as PropType<"button" | "submit" | "reset">,
    default: "button",
  },
  full: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String as PropType<"primary" | "secondary" | "accent">,
    default: "primary",
  },
  variant: {
    type: String as PropType<"solid" | "outline" | "link" | "ghost" | "soft">,
    default: "primary",
  },
});
</script>

<template>
  <button
    class="flex items-center justify-center gap-2 rounded-md px-4 py-1 transition-colors duration-300"
    :class="[
      full ? 'w-full' : '',
      loading ? 'opacity-50' : '',
      disabled ? 'cursor-not-allowed' : '',
      color === 'primary' ? 'hover:bg-inverted-hover dark:hover:bg-inverted-hover bg-black text-white dark:bg-white dark:text-black' : '',
      color === 'accent' ? 'bg-accent hover:bg-accent-hover text-inverted' : '',
    ]"
    :disabled
    :type="type"
  >
    <slot />
    <span v-if="loading" class="i-lucide-loader size-4 animate-spin" />
  </button>
</template>

<style scoped>

</style>
