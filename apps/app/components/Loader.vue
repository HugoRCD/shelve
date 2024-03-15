<script setup lang="ts">
defineProps({
  size: {
    type: String,
    default: "md",
  }
});
</script>

<template>
  <UIcon name="i-lucide-loader" class="animate-spin" :size />
</template>

<style scoped>

</style>
