<script setup lang="ts">
defineProps({
  size: {
    type: String,
    default: 'md',
  }
})
</script>

<template>
  <UIcon name="lucide:loader" class="animate-spin" :size />
</template>
