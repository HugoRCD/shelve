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

await fetchTeam(defaultTeamSlug.value)

useEnvironmentsService().fetchEnvironments()

const titleTemplate = computed(() => `%s - ${team.value?.name} - Shelve`)

useSeoMeta({
  titleTemplate,
})
</script>

<template>
  <NuxtPage />
</template>
