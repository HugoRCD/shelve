<script setup lang="ts">
import type { Team } from '@shelve/types'

definePageMeta({
  middleware: ['auth', 'onboarding'],
})

const teams = useTeams()
const loading = ref(false)
const { user } = useUserSession()

const {
  fetchTeams,
  selectTeam,
} = useTeamsService()

await fetchTeams()
const active = ref()

async function navigateToTeam(team: Team) {
  active.value = team.id
  loading.value = true
  await new Promise((resolve) => setTimeout(resolve, 250))
  await selectTeam(team, false)
  await useRouter().push(`/${team.slug}`)
}
</script>

<template>
  <div class="size-full overflow-hidden flex flex-col items-center justify-center max-sm:p-4">
    <div class="bg-stripes size-full -z-1 absolute top-0 left-0 opacity-30" />
    <div class="z-10 relative max-w-lg w-full">
      <div class="size-80 absolute rounded-full bg-neutral-100/20 -top-20 -z-1 -left-20 blur-[200px]" />
      <CrossedDiv line>
        <div class="bg-white dark:bg-neutral-900/70 p-8 dark:shadow-lg border border-neutral-200/70 dark:border-neutral-800/70 w-full backdrop-blur-md">
          <div class="flex flex-col items-center gap-2">
            <UAvatar :src="user?.avatar" class="size-18 avatar" />
            <div class="flex flex-col items-center">
              <h1 class="text-lg font-semibold">
                Welcome back, {{ user?.username }}
              </h1>
              <p class="text-neutral-500 italic">
                Select a team to get started
              </p>
            </div>
          </div>
          <div class="flex flex-col gap-4 mt-6">
            <div
              v-for="team in teams"
              :key="team.id"
              class="flex items-center justify-between gap-4 cursor-pointer dark:bg-neutral-950 bg-neutral-100/50 p-4 rounded-lg dark:shadow-md ring-2 ring-transparent hover:ring-orange-500 transition-colors duration-300 ease-in-out"
              @click="navigateToTeam(team)"
            >
              <div class="flex items-center gap-2">
                <UAvatar :src="team.logo" class="size-10 logo" :class="{ active: active === team.id }" />
                <div class="flex flex-col">
                  <span class="text-sm font-semibold team-name" :class="{ active: active === team.id }">{{ team.name }}</span>
                  <span class="text-xs text-neutral-500">{{ team.slug }}</span>
                </div>
              </div>
              <UButton size="sm" variant="soft" trailing :loading="loading && active === team.id">
                Select
              </UButton>
            </div>
          </div>
        </div>
      </CrossedDiv>
      <div class="flex items-center justify-center mt-4 gap-2">
        <Logo text-size="text-sm" />
        <SettingThemeToggle class="absolute top-4 right-4" />
      </div>
    </div>
  </div>
</template>
