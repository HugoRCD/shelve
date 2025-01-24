<script setup lang="ts">
definePageMeta({
  layout: 'app',
  middleware: ['auth', 'admin']
})
</script>

<template>
  <NuxtPage />
</template>

