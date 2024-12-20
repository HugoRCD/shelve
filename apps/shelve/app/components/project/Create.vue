<script setup lang="ts">
import type { CreateProjectInput } from '@shelve/types'

const projectCreateInput = ref<Omit<CreateProjectInput, 'teamId'>>({
  name: '',
  description: '',
  logo: '',
  repository: '',
  projectManager: '',
  homepage: '',
  variablePrefix: '',
})

const isOpen = ref(false)

const {
  loading: projectLoading,
  createProject,
} = useProjectsService()

const createLoading = ref(false)
async function createProjectFunction() {
  createLoading.value = true
  await createProject(projectCreateInput.value)
  projectCreateInput.value = {
    name: '',
    description: '',
    logo: '',
    repository: '',
    projectManager: '',
    homepage: '',
    variablePrefix: '',
  }
  isOpen.value = false
  createLoading.value = false
}

function importProject() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result
        if (typeof content === 'string') {
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
  <USlideover v-model:open="isOpen" title="Create a new project" description="Its time to create a new project, let's get started!">
    <UButton
      size="xs"
      icon="heroicons:plus-20-solid"
      :loading="projectLoading"
      label="Create project"
      @click="isOpen = true"
    />

    <template #body>
      <form id="createForm" class="flex flex-col gap-4" @submit.prevent="createProjectFunction">
        <FormGroup v-model="projectCreateInput.name" autofocus required label="Project name" />
        <FormGroup v-model="projectCreateInput.description" label="Description" type="textarea" />
        <USeparator class="my-4" />
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
        <USeparator class="my-4" />
        <div class="flex flex-col gap-4">
          <div>
            <h3 class="font-semibold">
              Logo
            </h3>
            <p class="text-pretty text-xs text-neutral-500 dark:text-neutral-400">
              Add a logo to your project
            </p>
          </div>
          <div class="flex flex-col items-center justify-center gap-4">
            <FormGroup v-model="projectCreateInput.logo" label="Project Logo" class="w-full" />
            <UAvatar :src="projectCreateInput.logo" size="3xl" :alt="projectCreateInput.name" />
          </div>
        </div>
      </form>
    </template>
    <template #footer>
      <div class="flex w-full justify-between">
        <div>
          <UButton variant="ghost" @click="importProject">
            Import project from JSON
          </UButton>
        </div>
        <div class="flex gap-4">
          <UButton variant="ghost" @click="isOpen = false">
            Cancel
          </UButton>
          <UButton type="submit" trailing :loading="createLoading" form="createForm">
            Create
          </UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>
