<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: 'user',
  middleware: ['admin']
})

useSeoMeta({
  titleTemplate: '%s - Shelve'
})
</script>

<template>
  <NuxtPage />
</template>
