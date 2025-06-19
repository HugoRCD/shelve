<script setup lang="ts">
definePageMeta({
  layout: 'app',
  middleware: ['auth', 'onboarding', 'default-team']
})

const route = useRoute()
const team = useTeam()
const teamSlug = computed(() => route.params.teamSlug as string)
const defaultTeamSlug = useCookie<string>('defaultTeamSlug')
defaultTeamSlug.value = teamSlug.value

const { fetchTeam } = useTeamsService()

await fetchTeam(teamSlug.value)

useEnvironmentsService().fetchEnvironments()

useSeoMeta({
  titleTemplate: () => `%s - ${team.value?.name} - Shelve`
})
</script>

<template>
  <NuxtPage />
</template>
