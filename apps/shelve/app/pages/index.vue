<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'onboarding'],
})

const teams = useTeams()

const {
  fetchTeams,
  selectTeam,
} = useTeamsService()

await fetchTeams()
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold">
      Teams
    </h1>
    <div v-for="team in teams" :key="team.id" class="flex items-center gap-2">
      <span class="cursor-pointer hover:underline" @click="selectTeam(team)">
        {{ team.name }}
      </span>
    </div>
  </div>
</template>
