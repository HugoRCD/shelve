<script setup lang="ts">
import { TeamRole } from '@types'
import { useCurrentLoading } from '~/composables/useProjects'
import type { FormSubmitEvent } from '#ui/types'
import { type UpdateProjectSchema, updateProjectSchema } from '~/utils/zod/project'

const route = useRoute()
const projectId = route.params.projectId as string
const project = useProject(projectId)

const currentLoading = useCurrentLoading()

const teamRole = useTeamRole()
const canUpdate = computed(() => hasAccess(teamRole.value, TeamRole.ADMIN))

async function onSubmit(event: FormSubmitEvent<UpdateProjectSchema>) {
  await useProjectsService().updateProject(event.data)
}
</script>

<template>
  <UForm v-if="project" :state="project" :schema="updateProjectSchema" class="flex flex-col gap-4" @submit="onSubmit">
    <UCard variant="subtle">
      <template #header>
        <div class="flex items-center">
          <div class="flex flex-col">
            <h2 class="text-lg font-semibold">
              Project Settings
            </h2>
            <p class="text-pretty text-sm text-muted">
              Configure your project settings, quick links, environment variables prefix, etc...
            </p>
          </div>
        </div>
      </template>
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-4">
          <div>
            <h3 class="font-semibold">
              Quick Links
            </h3>
            <p class="text-pretty text-xs text-muted">
              Add quick links to your project repository, homepage, etc...
            </p>
          </div>
          <div class="my-2 flex flex-col gap-4">
            <div :class="route.hash === '#repository' ? 'ring ring-primary rounded-lg p-4' : ''">
              <USkeleton v-if="currentLoading" class="h-8" />
              <UFormField
                v-else
                name="repository"
                label="Repository"
                help="Add a link to your project repository to enable GitHub integration."
                :ui="{ help: 'text-xs' }"
              >
                <div class="flex items-center gap-1">
                  <UInput v-model="project.repository" class="md:w-2/3" :disabled="!canUpdate" />
                  <ProjectRepoSelector v-model="project.repository" />
                </div>
              </UFormField>
            </div>
            <div>
              <USkeleton v-if="currentLoading" class="h-8" />
              <UFormField v-else name="projectManager" label="Project Manager">
                <UInput v-model="project.projectManager" class="md:w-2/3" :disabled="!canUpdate" />
              </UFormField>
            </div>
            <div>
              <USkeleton v-if="currentLoading" class="h-8" />
              <UFormField v-else name="homepage" label="Homepage">
                <UInput v-model="project.homepage" class="md:w-2/3" :disabled="!canUpdate" />
              </UFormField>
            </div>
          </div>
        </div>
        <Separator class="my-2" />
        <div id="variable-prefix" class="flex flex-col gap-4" :class="route.hash === '#variable-prefix' ? 'ring ring-primary rounded-lg p-4' : ''">
          <div>
            <h3 class="font-semibold">
              Environment Variables Prefix
            </h3>
            <p class="text-pretty text-xs text-muted">
              Add a prefix to your environment variables
            </p>
          </div>
          <div class="my-2 flex flex-col gap-4">
            <div>
              <USkeleton v-if="currentLoading" class="h-8" />
              <UFormField v-else v-model="project.variablePrefix" label="Prefix" class="md:w-2/3">
                <UTextarea v-model="project.variablePrefix" class="w-full" :disabled="!canUpdate" :rows="4" />
              </UFormField>
              <UTooltip text="Yes this will be improved in the future 😅">
                <p class="mt-1 text-xs text-muted">
                  Write your prefix separated by a comma, for example: <code>NUXT_PUBLIC_, REACT_APP_</code>
                </p>
              </UTooltip>
            </div>
          </div>
        </div>
      </div>
      <template v-if="canUpdate" #footer>
        <div class="flex justify-end gap-4">
          <UButton type="submit" trailing loading-auto>
            Save
          </UButton>
        </div>
      </template>
    </UCard>
  </UForm>
</template>
