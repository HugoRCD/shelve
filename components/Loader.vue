<script setup lang="ts">
const props = defineProps({
  size: {
    type: String,
    default: "size-4",
  }
});
</script>

<template>
  <span class="i-lucide-loader animate-spin" :class="size" />
</template>

<style scoped>

</style>
