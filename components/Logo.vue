<script setup lang="ts">
const { appName } = useAppConfig();
defineProps({
  isText: {
    type: Boolean,
    default: false,
  },
  size: {
    type: Number,
    default: 6,
  },
});
</script>

<template>
  <div id="main-logo">
    <NuxtLink
      to="/"
      class="flex shrink-0 items-center"
      aria-label="Go back to home page"
    >
      <span
        class="text-2xl font-bold"
        :style="{ fontSize: `${size}rem` }"
      >🚀</span>
      <span
        v-if="isText"
        class="ml-1 text-xs font-semibold"
      >{{ appName }}</span>
    </NuxtLink>
  </div>
</template>
