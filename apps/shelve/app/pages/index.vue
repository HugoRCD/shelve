<script setup lang="ts">
import type { Team } from '@types'

definePageMeta({
  middleware: ['auth', 'onboarding'],
})

const teams = useTeams()
const navLoading = ref(false)
const { user } = useUserSession()
const defaultTeamSlug = useCookie<string>('defaultTeamSlug')

const router = useRouter()

const {
  loading,
  fetchTeams,
  selectTeam,
} = useTeamsService()

const fetchError = ref(false)

onMounted(async () => {
  try {
    await fetchTeams()
    if (teams.value && teams.value.length === 1) {
      const [team] = teams.value
      if (team) {
        defaultTeamSlug.value = team.slug
        await router.push(`/${team.slug}`)
      }
    }
  } catch (error) {
    console.error('Failed to fetch teams:', error)
    fetchError.value = true
  }
})

const active = ref()

async function navigateToTeam(team: Team) {
  active.value = team.id
  navLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 100))
  defaultTeamSlug.value = team.slug
  await selectTeam(team)
}

useSeoMeta({
  title: () => `Home - ${user.value?.username}`,
  titleTemplate: '%s - Shelve'
})
</script>

<template>
  <div class="size-full overflow-hidden flex flex-col items-center justify-center max-sm:p-4">
    <div class="bg-stripes size-full -z-1 absolute top-0 left-0 opacity-30" />
    <div class="z-10 relative max-w-lg w-full">
      <div>
        <UButton
          variant="link"
          size="xs"
          class="absolute z-99 top-4 right-4"
          icon="nucleo:exit"
          square
          @click="useLogout"
        >
          Logout
        </UButton>
      </div>
      <div class="size-80 absolute rounded-full dark:bg-inverted/20 -top-20 -z-1 -left-20 blur-[200px]" />
      <CrossedDiv line>
        <div class="bg-muted p-8 dark:shadow-lg border border-default w-full backdrop-blur-md">
          <div class="flex flex-col items-center gap-2">
            <UAvatar :src="user?.avatar" class="size-18 avatar" />
            <div class="flex flex-col items-center">
              <h1 class="text-lg font-semibold">
                Welcome back, {{ user?.username }}
              </h1>
              <p class="text-muted italic">
                Select a team to get started
              </p>
            </div>
          </div>
          <div v-if="!loading && teams && teams.length > 0" class="flex flex-col gap-4 mt-6">
            <div
              v-for="team in teams"
              :key="team.id"
              class="flex items-center justify-between gap-4 cursor-pointer bg-default p-4 rounded-lg dark:shadow-md ring-2 ring-transparent hover:ring-primary transition-colors duration-300 ease-in-out"
              @click="navigateToTeam(team)"
            >
              <div class="flex items-center gap-2">
                <UAvatar :src="team.logo" class="size-10 logo" :class="{ active: active === team.id }" />
                <div class="flex flex-col">
                  <span class="text-sm font-semibold team-name" :class="{ active: active === team.id }">{{ team.name }}</span>
                  <span class="text-xs text-muted">{{ team.slug }}</span>
                </div>
              </div>
              <UButton size="sm" variant="soft" trailing :loading="navLoading && active === team.id">
                Select
              </UButton>
            </div>
          </div>
          <div v-else-if="fetchError" class="flex flex-col items-center gap-4 mt-6">
            <p class="text-muted text-center">
              Failed to load teams. Please try again.
            </p>
            <UButton variant="soft" label="Retry" @click="fetchTeams()" />
          </div>
          <div v-else-if="!loading && (!teams || teams.length === 0)" class="flex flex-col items-center gap-4 mt-6">
            <p class="text-muted text-center">
              You don't have any teams yet.
            </p>
            <UButton to="/onboarding" variant="soft" label="Create your first team" />
          </div>
          <div v-else class="flex flex-col gap-4 mt-6">
            <div v-for="i in 2" :key="i" class="flex items-center justify-between gap-4 bg-default p-4 rounded-lg dark:shadow-md">
              <div class="flex items-center gap-2">
                <USkeleton class="size-10 rounded-full" />
                <div class="flex flex-col gap-2">
                  <USkeleton class="w-40 h-3" />
                  <USkeleton class="w-16 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CrossedDiv>
      <div class="flex items-center justify-center mt-4 gap-2">
        <Logo text-size="text-sm" />
        <SettingThemeToggle class="absolute top-4 right-4" />
      </div>
    </div>
    <footer class="absolute bottom-0 mx-auto flex max-w-7xl flex-col items-center justify-around gap-4 px-4 py-6 sm:flex-row">
      <div class="flex items-center text-muted gap-4">
        <span class="text-sm flex items-center">
          Want to go back to homepage ?
          <UButton
            variant="link"
            icon="nucleo:house"
            :ui="{ leadingIcon: 'size-4' }"
            label="Click Here"
            to="https://shelve.cloud"
          />
        </span>
      </div>
    </footer>
  </div>
</template>
