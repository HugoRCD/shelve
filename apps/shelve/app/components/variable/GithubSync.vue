<script setup lang="ts">
import * as z from 'zod'
import type { Variable } from '@types'
import type { FormSubmitEvent } from '#ui/types'

type GithubSyncProps = {
  selectedVariables: Variable[]
}

const { selectedVariables } = defineProps<GithubSyncProps>()

const open = ref(false)
const route = useRoute()
const teamEnv = useEnvironments()

const teamSlug = route.params.teamSlug as string
const projectId = route.params.projectId as string
const project = useProject(projectId)

const syncVariablesSchema = z.object({
  repository: z.string(),
  environment: z.number(),
})

type SyncVariablesSchema = z.output<typeof syncVariablesSchema>

const state = ref({
  repository: sanitizeGithubUrl(project.value.repository),
  environment: teamEnv.value[0]?.id,
})

const { data: apps, status, refresh, error } = await useFetch('/api/github/apps', {
  method: 'GET',
  immediate: false,
})
if (error.value)
  throw createError({
    statusCode: error.value.statusCode,
    message: error.value.message,
    fatal: true,
  })

async function openGithubModal() {
  open.value = true
  await refresh()
}

const variablesToSend = computed(() => {
  return selectedVariables.map((v: Variable) => {
    return {
      key: v.key,
      value: v.values.find((v: any) => v.environmentId === state.value.environment)?.value,
    }
  }).filter((v: any) => v.value)
})

async function onSubmit(event: FormSubmitEvent<SyncVariablesSchema>) {
  try {
    await $fetch(`/api/github/secrets`, {
      method: 'POST',
      body: {
        variables: variablesToSend.value,
        repository: event.data.repository,
      }
    })
    toast.success('Variables have been sent to Github')
  } catch (error) {
    toast.error('Failed to send variables to Github')
  }
  open.value = false
}
</script>

<template>
  <div>
    <UTooltip v-if="project.repository" text="Send selected variables to Github">
      <UButton icon="simple-icons:github" variant="ghost" @click="openGithubModal" />
    </UTooltip>
    <UModal
      v-model:open="open"
      title="Sync with GitHub"
      :description="`${variablesToSend.length} variable${variablesToSend.length > 1 ? 's' : ''} ready to sync`"
      :ui="{ body: 'sm:p-4' }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <UIcon name="simple-icons:github" class="size-8" />
          <div>
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Sync with GitHub
            </h3>
            <p class="text-sm text-(--ui-text-muted)">
              Please select which environment you want to use.
            </p>
          </div>
        </div>
      </template>

      <template #body>
        <UForm v-if="status !== 'pending'" :state @submit="onSubmit">
          <div v-if="apps && apps.length" class="space-y-4">
            <div class="bg-neutral-100 dark:bg-neutral-800/50 p-4 rounded-lg">
              <UFormField name="repository" label="Target Repository">
                <template #help>
                  <div class="text-xs">
                    You can change the repository in the
                    <ULink :to="`/${teamSlug}/projects/${project.id}/settings#repository`" class="font-medium underline">
                      repository settings
                    </ULink>
                  </div>
                </template>
                <div class="flex items-center gap-2">
                  <UIcon
                    name="lucide:git-fork"
                    class="size-4 text-(--ui-text-muted)"
                  />
                  <UInput
                    v-model="state.repository"
                    :placeholder="sanitizeGithubUrl(state.repository)"
                    disabled
                    class="w-full !bg-white dark:!bg-neutral-900"
                  />
                </div>
              </UFormField>
            </div>

            <div class="bg-neutral-100 dark:bg-neutral-800/50 p-4 rounded-lg">
              <UFormField
                name="environment"
                label="Target Environment"
                :error="variablesToSend.length === 0 && 'No variables available for the selected environment'"
              >
                <URadioGroup
                  v-model="state.environment"
                  :items="teamEnv"
                  value-key="id"
                  label-key="name"
                >
                  <template #label="{ item }">
                    <span class="font-medium">{{ capitalize(item.name) }}</span>
                  </template>
                </URadioGroup>
              </UFormField>
            </div>

            <div class="bg-neutral-100 dark:bg-neutral-800/50 p-4 rounded-lg space-y-2">
              <div>
                <h4 class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Summary
                </h4>
                <p class="text-sm text-(--ui-text-muted)">
                  {{ variablesToSend.length }} variable(s) will be synchronized to your GitHub repository
                </p>
              </div>
              <UButton
                type="submit"
                loading-auto
                icon="simple-icons:github"
                :disabled="variablesToSend.length === 0"
                label="Sync with GitHub"
                block
              />
            </div>
            <p class="text-xs text-(--ui-text-muted) mt-2 bg-neutral-100 dark:bg-neutral-800/50 p-2 rounded-lg">
              <UIcon name="lucide:info" class="text-sm align-sub" /> This might cause overwriting of existing secrets in your repository
            </p>
          </div>

          <div v-else class="text-center py-8">
            <div class="bg-neutral-100 dark:bg-neutral-800/50 p-6 rounded-lg">
              <div class="flex flex-col items-center gap-4">
                <UIcon
                  name="simple-icons:github"
                  class="size-8 text-neutral-600 dark:text-neutral-300"
                />
                <div>
                  <h3 class="text-lg font-semibold mb-1">
                    No GitHub Apps Found
                  </h3>
                  <p class="text-sm text-(--ui-text-muted) mb-4">
                    Create a GitHub app to start syncing your secrets
                  </p>
                  <ULink href="/user/integrations/github">
                    <UButton
                      label="Set up GitHub Integration"
                      icon="lucide:arrow-right"
                      trailing
                      variant="soft"
                      class="font-medium"
                    />
                  </ULink>
                </div>
              </div>
            </div>
          </div>
        </UForm>

        <div v-else class="space-y-6">
          <div v-for="variable in 2" :key="variable">
            <div class="space-y-2">
              <USkeleton class="h-4 w-2/4" />
              <USkeleton class="h-4 w-1/4" />
            </div>
          </div>
          <USkeleton class="h-10 w-full" />
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>

</style>
