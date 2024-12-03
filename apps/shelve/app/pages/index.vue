<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'onboarding'],
})

const teamSlug = useTeamSlug()
</script>

<template>
  <div>
    <NuxtLink :to="`/${teamSlug}`">
      <h1>Projects</h1>
    </NuxtLink>
  </div>
</template>
