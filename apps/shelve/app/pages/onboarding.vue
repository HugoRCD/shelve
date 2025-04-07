<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth',
  middleware: 'auth'
})

const schema = z.object({
  teamName: z.string({ required_error: 'Team name is required' })
    .min(3, 'Team name must be at least 3 characters long')
    .max(20, 'Team name must be at most 20 characters long')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  teamName: undefined,
})

const { user } = useUserSession()

const {
  createTeam,
  selectTeam,
} = useTeamsService()

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

    await selectTeam(team)
  } catch (error) {
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
        <p class="text-(--ui-text-muted) italic">
          Let's create your first team together
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
      <UForm :state :schema class="space-y-2" @submit="createTeamAndCompleteOnboarding">
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
      </UForm>
    </Motion>
  </div>
</template>
