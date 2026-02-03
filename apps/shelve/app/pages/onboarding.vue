<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Team } from '@types'

definePageMeta({
  layout: 'auth',
  middleware: 'auth'
})

const schema = z.object({
  teamName: z.string({ error: 'Team name is required' })
    .min(3, 'Team name must be at least 3 characters long')
    .max(20, 'Team name must be at most 20 characters long')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  teamName: undefined,
})

const { user } = useUserSession()
const defaultTeamSlug = useCookie<string>('defaultTeamSlug')

const {
  createTeam,
  selectTeam,
  fetchTeams,
  loading,
} = useTeamsService()

const teams = useTeams()
const navLoading = ref(false)
const active = ref()
const showCreateForm = ref(false)

onMounted(async () => {
  await fetchTeams()
})

async function selectTeamAndCompleteOnboarding(team: Team) {
  active.value = team.id
  navLoading.value = true
  try {
    await $fetch('/api/user/onboarding', {
      method: 'POST',
      body: {
        teamSlug: team.slug,
      }
    })
    user.value!.onboarding = true
    defaultTeamSlug.value = team.slug
    await selectTeam(team)
  } catch (error) {
    console.error(error)
    toast.error('Failed to complete onboarding')
    navLoading.value = false
  }
}

async function createTeamAndCompleteOnboarding(event: FormSubmitEvent<Schema>) {
  try {
    const team = await createTeam(event.data.teamName)
    if (!team) return
    await $fetch('/api/user/onboarding', {
      method: 'POST',
      body: {
        teamSlug: team.slug,
      }
    })

    user.value!.onboarding = true

    defaultTeamSlug.value = team.slug
    await selectTeam(team)
  } catch (error) {
    console.error(error)
    toast.error('Failed to complete onboarding')
  }
}
</script>

<template>
  <div class="flex overflow-hidden size-full flex-col items-center justify-center">
    <div class="absolute top-4 left-4 opacity-20">
      <UTooltip text="Logout">
        <UButton icon="lucide:log-out" variant="ghost" @click="useLogout()" />
      </UTooltip>
    </div>
    <Motion
      class="bg-white rounded-full w-50 h-96 blur-[250px] absolute -top-40 select-none"
      :initial="{
        opacity: 0,
      }"
      :animate="{
        opacity: 1,
      }"
      :transition="{
        duration: 0.4,
      }"
    />
    <Motion
      class="mx-auto w-full flex flex-col items-center justify-center gap-2 text-center"
      :initial="{
        scale: 1.1,
        opacity: 0,
        filter: 'blur(10px)'
      }"
      :animate="{
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)'
      }"
      :transition="{
        duration: 0.7,
        delay: 0.4
      }"
    >
      <Logo :text="false" size="size-10" />
      <div class="flex flex-col items-center gap-1">
        <h1 class="text-center main-gradient text-3xl leading-9 italic">
          <ScrambleText label="Welcome to Shelve" />
        </h1>
        <p class="text-muted italic">
          <span v-if="teams && teams.length > 0">Select a team or create a new one</span>
          <span v-else>Let's create your first team together</span>
        </p>
      </div>
    </Motion>
    <Motion
      class="mt-6 space-y-2 w-full mx-auto max-w-xs"
      :initial="{
        scale: 1.1,
        opacity: 0,
        filter: 'blur(10px)',
      }"
      :animate="{
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)'
      }"
      :transition="{
        duration: 0.7,
        delay: 0.7
      }"
    >
      <!-- Team selector if teams exist -->
      <div v-if="teams && teams.length > 0 && !showCreateForm" class="space-y-4">
        <div v-if="!loading" class="flex flex-col gap-4">
          <div
            v-for="team in teams"
            :key="team.id"
            class="flex items-center justify-between gap-4 cursor-pointer bg-default p-4 rounded-lg dark:shadow-md ring-2 ring-transparent hover:ring-primary transition-colors duration-300 ease-in-out"
            @click="selectTeamAndCompleteOnboarding(team)"
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
        <div v-else class="flex flex-col gap-4">
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
        <UButton
          label="Create New Team"
          variant="outline"
          icon="lucide:circle-plus"
          block
          @click="showCreateForm = true"
        />
      </div>
      <!-- Original Team creation form -->
      <UForm v-else :state :schema class="space-y-2" @submit="createTeamAndCompleteOnboarding">
        <UFormField name="teamName">
          <UInput
            v-model="state.teamName"
            class="w-full"
            placeholder="Nuxtlabs, Vercel, etc."
          />
        </UFormField>
        <UButton
          label="Create Team"
          variant="subtle"
          icon="lucide:circle-plus"
          block
          loading-auto
          type="submit"
        />
        <UButton
          v-if="teams && teams.length > 0"
          label="Back to Teams"
          variant="ghost"
          block
          @click="showCreateForm = false"
        />
      </UForm>
    </Motion>
  </div>
</template>
