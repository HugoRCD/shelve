<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'auth'
})

const { user } = useUserSession()
const teamName = ref('')
const loading = ref(false)

const {
  createTeam,
  selectTeam,
} = useTeamsService()

async function createTeamAndCompleteOnboarding() {
  if (!teamName.value) {
    toast.error('Team name is required')
    return
  }
  loading.value = true
  try {
    const team = await createTeam(teamName.value)
    if (!team) {
      loading.value = false
      return
    }
    await $fetch('/api/user/onboarding', {
      method: 'POST',
      body: {
        teamSlug: team.slug,
      }
    })

    user.value!.onboarding = true

    await selectTeam(team)
  } catch (error) {
    toast.error('Failed to complete onboarding')
  }
  loading.value = false
}
</script>

<template>
  <div class="flex overflow-hidden size-full flex-col items-center justify-center">
    <div class="bg-white rounded-full w-50 h-96 blur-[250px] absolute -top-40 select-none" />
    <div class="mx-auto w-full flex flex-col items-center justify-center gap-2 text-center">
      <UIcon name="custom:shelve" class="size-10" />
      <div class="flex flex-col items-center gap-1">
        <h1 class="text-center text-3xl leading-9">
          Welcome to Shelve!
        </h1>
        <p class="text-neutral-500 italic dark:text-neutral-400">
          Let's create your first team together
        </p>
      </div>
    </div>
    <form class="mt-6 space-y-2 max-w-5xl" @submit.prevent="createTeamAndCompleteOnboarding">
      <UInput v-model="teamName" class="w-full" placeholder="Nuxtlabs, Vercel, etc." required />
      <UButton label="Create Team" block :loading type="submit" />
    </form>
  </div>
</template>
