<script setup lang="ts">
definePageMeta({
  layout: 'app',
  middleware: ['auth', 'onboarding', 'default-team']
})

const defaultTeamId = useCookie<number>('defaultTeamId', {
  watch: true,
})
const defaultTeamSlug = useCookie<string>('defaultTeamSlug', {
  watch: true,
})

const team = useTeam()
if (!team.value) {
  team.value = await useTeamsService().fetchTeam(defaultTeamId.value)
}
defaultTeamSlug.value = team.value.slug

useEnvironmentsService().fetchEnvironments()
</script>

<template>
  <NuxtPage />
</template>
