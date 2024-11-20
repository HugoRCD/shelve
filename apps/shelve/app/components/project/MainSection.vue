<script setup lang="ts">
import type { Project } from '@shelve/types'
import type { Ref } from 'vue'

type ProjectProps = {
  project: Project
  loading: boolean
}

const props = defineProps<ProjectProps>()

const showEdit = ref(false)
const showDelete = ref(false)
const projectName = ref('')
const project = toRef(props, 'project') as Ref<Project>
const { projectId } = useRoute().params as { projectId: string }
const { user } = useUserSession()

const {
  updateProject,
  deleteProject,
} = useProjects()

const updateLoading = ref(false)
async function updateCurrentProject() {
  updateLoading.value = true
  await updateProject(+projectId, project.value)
  showEdit.value = false
  updateLoading.value = false
}

const deleteLoading = ref(false)
async function deleteProjectFunction() {
  deleteLoading.value = true
  // TODO: Add permission check
  await deleteProject(+projectId)
  deleteLoading.value = false
  showDelete.value = false
  navigateTo('/')
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
      label: 'Delete project',
      icon: 'lucide:trash',
      iconClass: 'text-red-500 dark:text-red-500',
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
    <div v-if="!loading">
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-4">
          <UAvatar :src="project.logo" size="xl" :alt="project.name" />
          <div>
            <h2 class="text-base font-semibold leading-7">
              {{ project.name }}
            </h2>
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
                  <FormGroup v-model="project.logo" label="Avatar" class="w-full" />
                </div>
                <div class="flex justify-end gap-4">
                  <UButton color="neutral" variant="ghost" @click="showEdit = false">
                    Cancel
                  </UButton>
                  <UButton color="primary" type="submit" trailing :loading="updateLoading">
                    Save
                  </UButton>
                </div>
              </form>
            </template>
          </UModal>
        </div>
        <UDropdownMenu
          :items
          :content="{
            align: 'start',
            side: 'right',
            sideOffset: 8
          }"
        >
          <UButton color="neutral" variant="ghost" icon="heroicons:ellipsis-horizontal-20-solid" />
        </UDropdownMenu>
      </div>
      <div v-if="project.projectManager || project.repository || project.homepage" class="mt-6 flex flex-wrap gap-4 sm:flex-row sm:items-center">
        <NuxtLink v-if="project.projectManager" target="_blank" :to="project.projectManager">
          <UButton
            color="neutral"
            variant="soft"
            size="xs"
            :icon="getProjectManager(project.projectManager)?.icon"
            :label="`Open ${getProjectManager(project.projectManager)?.label}`"
            :ui="{ leadingIcon: 'dark:fill-white fill-black' }"
          />
        </NuxtLink>
        <NuxtLink v-if="project.repository" target="_blank" :to="project.repository">
          <UButton
            color="neutral"
            variant="soft"
            size="xs"
            icon="simple-icons:github"
            label="Open repository"
            :ui="{ leadingIcon: 'dark:fill-white fill-black' }"
          />
        </NuxtLink>
        <NuxtLink v-if="project.homepage" target="_blank" :to="project.homepage">
          <UButton
            color="neutral"
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
            <UButton color="neutral" variant="ghost" @click="showDelete = false">
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
