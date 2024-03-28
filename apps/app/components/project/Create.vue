<script setup lang="ts">
import type { CreateProjectInput, Team } from "@shelve/types";

const { refresh } = defineProps({
  refresh: {
    type: Function,
    required: true,
  },
})
const projectCreateInput = ref<CreateProjectInput>({
  name: "",
  description: "",
  avatar: "",
  repository: "",
  projectManager: "",
  homepage: "",
})

const isOpen = ref(false)

const { status: createStatus, error: createError, execute } = useFetch("/api/project", {
  method: "POST",
  body: projectCreateInput,
  watch: false,
  immediate: false,
})

async function createProject() {
  await execute()
  if (createError.value) toast.error("An error occurred")
  else {
    toast.success("Your project has been created")
    isOpen.value = false
    await refresh()
  }
}

function addTeam(team: Team) {
  projectCreateInput.value.team = team
}

function removeTeam() {
  delete projectCreateInput.value.team
}

const {
  fetchTeams,
  loading
} = useTeams();
fetchTeams()

const teams = useUserTeams();

function importProject() {
  const input = document.createElement("input")
  input.type = "file"
  input.accept = ".json"
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result
        if (typeof content === "string") {
          const data = JSON.parse(content)
          projectCreateInput.value = {
            ...projectCreateInput.value,
            ...data,
          }
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}
</script>

<template>
  <div>
    <UButton
      size="xs"
      icon="i-heroicons-plus-20-solid"
      :loading="createStatus === 'pending'"
      label="Add project"
      @click="isOpen = true"
    />

    <USlideover v-model="isOpen">
      <form class="flex flex-1 overflow-y-auto" @submit.prevent="createProject">
        <UCard class="flex flex-1 flex-col" :ui="{ body: { base: 'flex-1' }, ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
            <h3 class="text-lg font-semibold">
              Create a new project
            </h3>
            <p class="text-sm font-normal text-gray-500">
              Its time to create a new project, let's get started!
            </p>
          </template>

          <div class="flex flex-col gap-4 p-2">
            <FormGroup v-model="projectCreateInput.name" required label="Project name" />
            <FormGroup v-model="projectCreateInput.description" label="Description" type="textarea" />
            <UDivider class="my-4" />
            <div class="flex flex-col gap-4">
              <div>
                <h3 class="font-semibold">
                  Team Members
                </h3>
                <p class="text-pretty text-xs text-neutral-500 dark:text-neutral-400">
                  Add team members to your project
                </p>
              </div>
              <div>
                <USkeleton v-if="loading" class="h-8" />
                <div v-else>
                  <div v-if="projectCreateInput.team" class="flex items-center justify-between">
                    <div class="flex flex-col gap-2">
                      <h3 class="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                        {{ projectCreateInput.team.name }}
                      </h3>
                      <TeamMembers :team-id="projectCreateInput.team.id" :members="projectCreateInput.team.members" display />
                    </div>
                    <UButton
                      variant="soft"
                      color="red"
                      class="text-xs"
                      label="Unlink"
                      icon="i-lucide-unlink"
                      @click="removeTeam"
                    />
                  </div>
                  <div v-else class="flex flex-col gap-4">
                    <div v-if="teams.length !== 0" class="flex flex-col gap-4">
                      <div v-for="team in teams" :key="team.id" class="divide-y divide-gray-100 dark:divide-gray-800">
                        <ProjectTeamAssign :team="team" :project-id="0" is-emit @add-team="addTeam" />
                      </div>
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
            <UDivider class="my-4" />
            <div class="flex flex-col gap-4">
              <div>
                <h3 class="font-semibold">
                  Quick Links
                </h3>
                <p class="text-pretty text-xs text-neutral-500 dark:text-neutral-400">
                  Add quick links to your project repository, homepage, etc...
                </p>
              </div>
              <div>
                <FormGroup v-model="projectCreateInput.repository" label="Repository" />
              </div>
              <div>
                <FormGroup v-model="projectCreateInput.projectManager" label="Project Manager" />
              </div>
              <div>
                <FormGroup v-model="projectCreateInput.homepage" label="Homepage" />
              </div>
            </div>
            <UDivider class="my-4" />
            <div class="flex flex-col gap-4">
              <div>
                <h3 class="font-semibold">
                  Avatar
                </h3>
                <p class="text-pretty text-xs text-neutral-500 dark:text-neutral-400">
                  Add an avatar to your project
                </p>
              </div>
              <div class="flex flex-col items-center justify-center gap-4">
                <FormGroup v-model="projectCreateInput.avatar" label="Project avatar" class="w-full" />
                <UAvatar :src="projectCreateInput.avatar" size="3xl" :alt="projectCreateInput.name" />
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-between">
              <div>
                <UButton color="gray" variant="ghost" @click="importProject">
                  Import project from JSON
                </UButton>
              </div>
              <div class="flex gap-4">
                <UButton color="gray" variant="ghost" @click="isOpen = false">
                  Cancel
                </UButton>
                <UButton color="primary" type="submit" trailing :loading="createStatus === 'pending'">
                  Save
                </UButton>
              </div>
            </div>
          </template>
        </UCard>
      </form>
    </USlideover>
  </div>
</template>
