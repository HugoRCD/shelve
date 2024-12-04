<script setup lang="ts">
definePageMeta({
  layout: 'app',
  middleware: ['auth', 'onboarding', 'default-team']
})

const defaultTeamId = useCookie<number>('defaultTeamId', {
  watch: true,
})

const route = useRoute()
const teamSlug = useTeamSlug()

teamSlug.value = route.params.teamSlug as string

const team = useTeam()
team.value = await useTeamsService().fetchTeam(defaultTeamId.value)
useEnvironmentsService().fetchEnvironments()
</script>

<template>
  <NuxtPage />
</template>
