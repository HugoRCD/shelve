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
    default: true,
  },
  variant: {
    type: String as PropType<"solid" | "outline" | "link" | "ghost" | "soft">,
    default: "primary",
  },
});
</script>

<template>
  <button
    class="flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-inverted transition-colors duration-300 hover:bg-accent-hover"
    :class="[
      full ? 'w-full' : '',
      loading ? 'opacity-50' : '',
      disabled ? 'cursor-not-allowed' : '',
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
