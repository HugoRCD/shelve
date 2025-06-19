<script setup lang="ts">
definePageMeta({
  layout: 'app',
  middleware: ['auth', 'admin']
})

useSeoMeta({
  titleTemplate: '%s - Shelve'
})
</script>

<template>
  <NuxtPage />
</template>

