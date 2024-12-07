<script setup lang="ts">
definePageMeta({
  layout: 'app',
  middleware: ['auth', 'onboarding', 'default-team']
})

const defaultTeamId = useCookie<number>('defaultTeamId', {
  watch: true,
})

const team = useTeam()
if (!team.value) team.value = await useTeamsService().fetchTeam(defaultTeamId.value)

useEnvironmentsService().fetchEnvironments(defaultTeamId.value)
</script>

<template>
  <NuxtPage />
</template>
