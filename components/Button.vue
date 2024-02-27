<script setup lang="ts">
import type { PropType } from "vue";

const props = defineProps({
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
});
</script>

<template>
  <button
    class="button"
    :class="[
      full ? 'w-full' : '',
      loading ? 'opacity-50' : '',
      disabled ? 'cursor-not-allowed' : '',
    ]"
    :disabled
    :type="type"
  >
    <slot />
    <span
      v-if="loading"
      class="i-lucide-loader size-4 animate-spin"
    />
  </button>
</template>

<style scoped>

</style>
