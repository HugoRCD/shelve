<script setup lang="ts">
definePageMeta({
  layout: 'app',
  middleware: ['auth', 'onboarding', 'default-team']
})

const defaultTeamSlug = useCookie<number>('defaultTeamSlug', {
  watch: true,
})

const team = useTeam()
if (!team.value) team.value = await useTeamsService().fetchTeam(defaultTeamSlug.value)

useEnvironmentsService().fetchEnvironments()
</script>

<template>
  <NuxtPage />
</template>
