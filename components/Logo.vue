<script setup lang="ts">
const { title } = useAppConfig();
defineProps({
  isText: {
    type: Boolean,
    default: false,
  },
  isLogo: {
    type: Boolean,
    default: true,
  },
  size: {
    type: Number,
    default: 6,
  },
});
</script>

<template>
  <div id="main-logo">
    <NuxtLink to="/" class="flex shrink-0 items-center" aria-label="Go back to home page">
      <span v-if="isLogo" class="text-2xl font-bold" :style="{ fontSize: `${size}rem` }">🚀</span>
      <span v-if="isText" class="ml-1 font-semibold" :style="{ fontSize: `${size}rem` }">{{ title }}</span>
    </NuxtLink>
  </div>
</template>
