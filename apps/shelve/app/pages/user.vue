<script setup lang="ts">
definePageMeta({
  layout: 'app',
  middleware: ['auth']
})

useSeoMeta({
  titleTemplate: '%s - Shelve',
})
</script>

<template>
  <NuxtPage />
</template>

