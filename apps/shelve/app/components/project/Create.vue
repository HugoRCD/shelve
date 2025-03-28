<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import { type CreateProjectSchema, createProjectSchema } from '~/utils/zod/project'

const state = ref<Partial<CreateProjectSchema>>({
  name: undefined,
  description: undefined,
  logo: undefined,
  repository: undefined,
  projectManager: undefined,
  homepage: undefined,
  variablePrefix: undefined,
})

const isOpen = ref(false)

const {
  loading: projectLoading,
  createProject,
} = useProjectsService()

async function onSubmit(event: FormSubmitEvent<CreateProjectSchema>) {
  await createProject(event.data)
  isOpen.value = false
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
          state.value = {
            ...state.value,
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
    <CustomButton
      size="xs"
      icon="heroicons:plus-20-solid"
      :loading="projectLoading"
      label="Create project"
      @click="isOpen = true"
    />

    <template #body>
      <UForm id="createForm" :state :schema="createProjectSchema" class="flex h-full flex-col gap-4" @submit="onSubmit">
        <UFormField name="name" label="Project name" required>
          <UInput v-model="state.name" class="w-full" />
        </UFormField>
        <UFormField name="description" label="Description">
          <UTextarea v-model="state.description" class="w-full" autoresize />
        </UFormField>
        <USeparator class="my-4" />
        <div class="flex flex-col gap-4">
          <div>
            <h3 class="font-semibold">
              Quick Links
            </h3>
            <p class="text-pretty text-xs text-(--ui-text-muted)">
              Add quick links to your project repository, homepage, etc...
            </p>
          </div>
          <UFormField
            name="repository"
            label="Repository"
            help="Add a link to your project repository to enable GitHub integration."
            :ui="{ help: 'text-xs' }"
          >
            <div class="flex items-center gap-1">
              <UInput v-model="state.repository" class="w-full" />
              <ProjectRepoSelector v-model="state.repository" />
            </div>
          </UFormField>
          <UFormField name="homepage" label="Homepage">
            <UInput v-model="state.homepage" class="w-full" />
          </UFormField>
          <UFormField name="projectManager" label="Project Manager">
            <UInput v-model="state.projectManager" class="w-full" />
          </UFormField>
        </div>
        <USeparator class="my-4" />
        <div class="flex flex-col gap-4">
          <div>
            <h3 class="font-semibold">
              Logo
            </h3>
            <p class="text-pretty text-xs text-(--ui-text-muted)">
              Add a logo to your project
            </p>
          </div>
          <div class="flex flex-col items-center justify-center gap-4">
            <UFormField name="logo" label="Project Logo" class="w-full">
              <UInput v-model="state.logo" class="w-full" />
            </UFormField>
            <UAvatar :src="state.logo" size="3xl" :alt="state.name" />
          </div>
        </div>
        <div class="h-full flex justify-end">
          <div class="flex w-full items-end justify-between">
            <div>
              <UButton variant="ghost" @click="importProject">
                Import project from JSON
              </UButton>
            </div>
            <div class="flex gap-4">
              <UButton variant="ghost" @click="isOpen = false">
                Cancel
              </UButton>
              <UButton type="submit" trailing loading-auto form="createForm">
                Create
              </UButton>
            </div>
          </div>
        </div>
      </UForm>
    </template>
  </USlideover>
</template>
