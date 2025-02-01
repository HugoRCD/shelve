<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import { TeamRole } from '@types'
import { updateProjectSchema } from '~/utils/zod/project'

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

const deleteState = ref({
  name: undefined,
})

const validate = (state: any): FormError[] => {
  const errors = []
  if (state.name !== project.value.name) {
    errors.push({
      name: 'name',
      message: 'The project name does not match'
    })
  }
  return errors
}

async function onSubmitDelete() {
  if (teamRole.value !== TeamRole.OWNER) {
    toast.error('You do not have permission to delete this project')
    return
  }
  await deleteProject()
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
  ],
  [
    {
      label: 'Delete project',
      icon: 'lucide:trash',
      color: 'error',
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
              <UForm :state="project" :schema="updateProjectSchema" class="flex flex-col gap-4" @submit.prevent="updateCurrentProject">
                <UFormField label="Name" name="name">
                  <UInput v-model="project.name" class="w-full" />
                </UFormField>
                <UFormField label="Description" name="description">
                  <UTextarea v-model="project.description" class="w-full" />
                </UFormField>
                <div class="flex items-center gap-4 w-full">
                  <UAvatar :src="project.logo" size="xl" :alt="project.name" />
                  <UFormField label="Logo" name="logo" class="w-full">
                    <UInput v-model="project.logo" class="w-full" />
                  </UFormField>
                </div>
                <div class="flex justify-end gap-4">
                  <UButton variant="ghost" @click="showEdit = false">
                    Cancel
                  </UButton>
                  <UButton type="submit" trailing :loading="updateLoading">
                    Save
                  </UButton>
                </div>
              </UForm>
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
    <UModal v-model:open="showDelete" title="Delete this project?" description="This action cannot be undone">
      <template #body>
        <UForm
          :state="deleteState"
          :validate
          :validate-on="['change']"
          class="flex flex-col gap-6"
          @submit.prevent="onSubmitDelete"
        >
          <UFormField :label="`Type the project name '${project.name}' to confirm`" name="name">
            <UInput v-model="deleteState.name" autofocus class="w-full" />
          </UFormField>
          <div class="flex justify-end gap-4">
            <UButton variant="ghost" @click="showDelete = false">
              Cancel
            </UButton>
            <UButton color="error" type="submit" trailing loading-auto :disabled="deleteState.name !== project.name">
              Delete
            </UButton>
          </div>
        </UForm>
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
