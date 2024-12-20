<script setup lang="ts">
import { TeamRole } from '@shelve/types'

const showEdit = ref(false)
const showDelete = ref(false)

const projectName = ref('')
const teamRole = useTeamRole()
const route = useRoute()
const teamSlug = route.params.teamSlug as string
const projectId = route.params.projectId as string
const project = useProject(projectId)

const {
  currentLoading,
  updateProject,
  deleteProject,
} = useProjectsService()

const updateLoading = ref(false)
async function updateCurrentProject() {
  updateLoading.value = true
  await updateProject(project.value)
  showEdit.value = false
  updateLoading.value = false
}

const deleteLoading = ref(false)
async function deleteProjectFunction() {
  deleteLoading.value = true
  if (teamRole.value !== TeamRole.OWNER) {
    deleteLoading.value = false
    toast.error('You do not have permission to delete this project')
    return
  }
  await deleteProject()
  deleteLoading.value = false
  showDelete.value = false
  navigateTo(`/${teamSlug}`)
}

const items = [
  [
    {
      label: 'Edit project',
      icon: 'lucide:pen-line',
      onSelect: () => showEdit.value = !showEdit.value
    },
    {
      label: 'Export project data',
      icon: 'lucide:download',
      onSelect: () => {
        const sanitizedProject = JSON.parse(JSON.stringify(project.value))
        delete sanitizedProject.id
        delete sanitizedProject.ownerId
        delete sanitizedProject.teamId
        const data = JSON.stringify(sanitizedProject, null, 2)
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${project.value.name}.json`
        a.click()
      }
    },
    {
      label: 'Download project config',
      icon: 'lucide:download',
      onSelect: () => {
        const config = {
          '$schema': 'https://raw.githubusercontent.com/HugoRCD/shelve/main/packages/types/schema.json',
          'project': project.value.name,
          'slug': teamSlug
        }
        const data = JSON.stringify(config, null, 2)
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `shelve.config.json`
        a.click()
      }
    },
    {
      label: 'Delete project',
      icon: 'lucide:trash',
      iconClass: 'text-red-500 dark:text-red-500',
      disabled: teamRole.value !== TeamRole.OWNER,
      onSelect: () => showDelete.value = !showDelete.value
    }
  ]
]

const projectManager = [
  {
    label: 'Linear',
    value: 'linear',
    icon: 'custom:linear',
  },
  {
    label: 'Volta',
    value: 'volta',
    icon: 'custom:volta',
  },
]

function getProjectManager(manager: string) {
  if (!manager) return
  return projectManager.find((item) => manager.includes(item.value))
}
</script>

<template>
  <div>
    <div v-if="!currentLoading && project">
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-4">
          <UAvatar :src="project.logo" size="xl" :alt="project.name" class="logo" />
          <div>
            <h3 class="text-base font-semibold leading-7">
              {{ project.name }}
            </h3>
            <p class="text-sm leading-6 text-neutral-500">
              {{ project.description }}
            </p>
          </div>
          <UModal v-model:open="showEdit" title="Edit project" description="Update your project settings">
            <template #body>
              <form class="flex flex-col gap-4" @submit.prevent="updateCurrentProject">
                <FormGroup v-model="project.name" label="Name" />
                <FormGroup v-model="project.description" label="Description" type="textarea" />
                <div class="flex items-center gap-4">
                  <UAvatar :src="project.logo" size="xl" :alt="project.name" />
                  <FormGroup v-model="project.logo" label="Logo" class="w-full" />
                </div>
                <div class="flex justify-end gap-4">
                  <UButton variant="ghost" @click="showEdit = false">
                    Cancel
                  </UButton>
                  <UButton type="submit" trailing :loading="updateLoading">
                    Save
                  </UButton>
                </div>
              </form>
            </template>
          </UModal>
        </div>
        <UDropdownMenu
          v-if="hasAccess(teamRole, TeamRole.ADMIN)"
          :items
          :content="{
            align: 'start',
            side: 'right',
            sideOffset: 8
          }"
        >
          <UButton variant="ghost" icon="heroicons:ellipsis-horizontal-20-solid" />
        </UDropdownMenu>
      </div>
      <div v-if="project.projectManager || project.repository || project.homepage" class="mt-6 flex flex-wrap gap-4 sm:flex-row sm:items-center">
        <NuxtLink v-if="project.projectManager" target="_blank" :to="project.projectManager">
          <UButton
            variant="soft"
            size="xs"
            :icon="getProjectManager(project.projectManager)?.icon"
            :label="`Open ${getProjectManager(project.projectManager)?.label}`"
            :ui="{ leadingIcon: 'dark:fill-white fill-black' }"
          />
        </NuxtLink>
        <NuxtLink v-if="project.repository" target="_blank" :to="project.repository">
          <UButton
            variant="soft"
            size="xs"
            icon="simple-icons:github"
            label="Open repository"
            :ui="{ leadingIcon: 'dark:fill-white fill-black' }"
          />
        </NuxtLink>
        <NuxtLink v-if="project.homepage" target="_blank" :to="project.homepage">
          <UButton
            variant="soft"
            size="xs"
            icon="heroicons:home"
            label="Open homepage"
          />
        </NuxtLink>
      </div>
    </div>
    <div v-else class="flex items-start justify-between gap-4">
      <div class="flex w-full items-start gap-4">
        <div>
          <USkeleton class="size-14 rounded-full" />
        </div>
        <div class="w-full space-y-2">
          <USkeleton class="h-4 w-[55%]" />
          <USkeleton class="h-4 w-3/4" />
          <USkeleton class="h-4 w-1/4" />
        </div>
      </div>
    </div>
    <UModal v-model:open="showDelete" title="Are you sure you want to delete this project?" description="This action cannot be undone">
      <template #body>
        <form class="flex flex-col gap-6" @submit.prevent="deleteProjectFunction">
          <FormGroup v-model="projectName" autofocus :label="`Type the project name '${project.name}' to confirm`" />
          <div class="flex justify-end gap-4">
            <UButton variant="ghost" @click="showDelete = false">
              Cancel
            </UButton>
            <UButton color="error" type="submit" trailing :loading="deleteLoading" :disabled="projectName !== project.name">
              Delete
            </UButton>
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.logo {
  view-transition-name: project-logo;
}

h3 {
  view-transition-name: project-name;
}

p {
  view-transition-name: project-description;
}
</style>
