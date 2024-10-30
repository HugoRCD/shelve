<script setup lang="ts">
import { type Project, TeamRole } from '@shelve/types'
import type { Ref } from 'vue'

const { projectId } = useRoute().params

const { user } = useUserSession()

const project = inject('project') as Ref<Project>
const loading = inject('loading') as Ref<boolean>

const { status: updateStatus, error: updateError, execute } = useFetch(`/api/project/${projectId}`, {
  method: 'PUT',
  body: project,
  watch: false,
  immediate: false,
})

async function updateCurrentProject() {
  await execute()
  if (updateError.value) toast.error('An error occurred')
  else toast.success('Your project has been updated')
}

const {
  fetchTeams,
  loading: teamsLoading
} = useTeams()
fetchTeams()

const userTeams = useUserTeams()
const projectTeam = computed(() => userTeams.value.find((team) => team.id === project.value?.teamId))

const removeLoading = ref(false)
const refresh = inject('refresh') as () => Promise<void>

async function removeTeamFromProject(teamId: number) {
  removeLoading.value = true
  try {
    await $fetch(`/api/project/${projectId}/team/${teamId}`, {
      method: 'DELETE',
    })
    toast.success('Team removed from project')
    await refresh()
  } catch (error) {
    toast.error('An error occurred')
  }
  removeLoading.value = false
}
</script>

<template>
  <form class="mt-6 flex flex-col gap-4" @submit.prevent="updateCurrentProject">
    <UCard :ui="{ background: 'bg-white dark:bg-neutral-950' }">
      <template #header>
        <div class="flex items-center">
          <div class="flex flex-col">
            <h2 class="text-lg font-semibold">
              Project Settings
            </h2>
            <p class="text-pretty text-sm text-neutral-500 dark:text-neutral-400">
              Configure your project settings, quick links, environment variables prefix, etc...
            </p>
          </div>
        </div>
      </template>
      <div class="flex flex-col gap-4">
        <div class="ga-4 flex flex-col">
          <div>
            <h3 class="font-semibold">
              Project team <span v-if="project && project.team" class="text-sm text-neutral-500 dark:text-neutral-400">({{ project.team.name }})</span>
            </h3>
            <p class="text-pretty text-xs text-neutral-500 dark:text-neutral-400">
              Link a team to your project
            </p>
          </div>
          <div class="mt-4 flex flex-col gap-4">
            <div>
              <USkeleton v-if="teamsLoading && !userTeams" class="h-8" />
              <div v-else>
                <div v-if="project && projectTeam" class="flex items-center justify-between">
                  <TeamMembers :team-id="project.teamId" :members="projectTeam.members" />
                  <UButton
                    v-if="projectTeam.members.find(member => member.userId === user?.id)?.role === TeamRole.OWNER"
                    variant="soft"
                    color="error"
                    size="xs"
                    :loading="removeLoading"
                    label="Unlink"
                    icon="lucide:unlink"
                    @click="removeTeamFromProject(project.teamId)"
                  />
                </div>
                <div v-else class="flex flex-col gap-4">
                  <div v-if="userTeams.length !== 0" class="flex flex-col gap-4">
                    <ProjectTeamAssign v-for="team in userTeams" :key="team.id" :team :project-id="project.id" />
                  </div>
                  <div v-else class="flex flex-col items-center justify-center gap-2">
                    <p class="text-pretty text-xs text-neutral-500 dark:text-neutral-400">
                      You don't have any teams yet
                    </p>
                    <TeamCreate>Create one</TeamCreate>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!--        <UDivider class="my-2" />-->
        <div class="flex flex-col gap-4">
          <div>
            <h3 class="font-semibold">
              Quick Links
            </h3>
            <p class="text-pretty text-xs text-neutral-500 dark:text-neutral-400">
              Add quick links to your project repository, homepage, etc...
            </p>
          </div>
          <div class="my-2 flex flex-col gap-4">
            <div>
              <USkeleton v-if="loading" class="h-8" />
              <FormGroup v-else v-model="project.repository" label="Repository" class="md:w-2/3" />
            </div>
            <div>
              <USkeleton v-if="loading" class="h-8" />
              <FormGroup v-else v-model="project.projectManager" label="Project Manager" class="md:w-2/3" />
            </div>
            <div>
              <USkeleton v-if="loading" class="h-8" />
              <FormGroup v-else v-model="project.homepage" label="Homepage" class="md:w-2/3" />
            </div>
          </div>
        </div>
        <!--        <UDivider class="my-2" />-->
        <div class="flex flex-col gap-4">
          <div>
            <h3 class="font-semibold">
              Environment Variables Prefix
            </h3>
            <p class="text-pretty text-xs text-neutral-500 dark:text-neutral-400">
              Add a prefix to your environment variables
            </p>
          </div>
          <div class="my-2 flex flex-col gap-4">
            <div>
              <USkeleton v-if="loading" class="h-8" />
              <FormGroup v-else v-model="project.variablePrefix" type="textarea" label="Prefix" class="md:w-2/3" />
              <UTooltip text="Yes this will be improved in the future 😅">
                <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Write your prefix separated by a comma, for example: <code>NUXT_PUBLIC_, REACT_APP_</code>
                </p>
              </UTooltip>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-4">
          <UButton color="primary" type="submit" :loading="updateStatus === 'pending'">
            Save
          </UButton>
        </div>
      </template>
    </UCard>
  </form>
</template>
