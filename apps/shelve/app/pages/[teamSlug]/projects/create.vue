<script setup lang="ts">
import type { GitHubRepo } from '@types'
import type { FormSubmitEvent } from '#ui/types'
import { type CreateProjectSchema, createProjectSchema } from '~/utils/zod/project'

const repoToImport = ref<GitHubRepo | undefined>(undefined)

const state = ref<Partial<CreateProjectSchema>>({
  name: undefined,
  description: undefined,
  logo: undefined,
  repository: undefined,
  projectManager: undefined,
  homepage: undefined,
  variablePrefix: undefined,
})

const { createProject } = useProjectsService()

async function onSubmit(event: FormSubmitEvent<CreateProjectSchema>) {
  await createProject(event.data)
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

useHead({
  title: 'Create New Project',
})

useSeoMeta({
  title: 'Create New Project',
  description: 'Create a new project in Shelve',
})

watch(repoToImport, (newRepo) => {
  if (newRepo) {
    state.value.repository = newRepo.html_url || undefined
    state.value.name = newRepo.name || undefined
    state.value.description = newRepo.description || undefined
    state.value.logo = newRepo.owner.avatar_url || undefined
    state.value.homepage = newRepo.homepage || undefined
  }
})

function reset() {
  state.value = {
    name: undefined,
    description: undefined,
    logo: undefined,
    repository: undefined,
    homepage: undefined,
    projectManager: undefined,
    variablePrefix: undefined,
  }
}
</script>

<template>
  <PageSection
    title="Create a new project"
    description="Let's set up your new project. Fill in the details below to get started."
  >
    <UForm
      id="createForm"
      :state
      :schema="createProjectSchema"
      class="flex flex-col gap-6"
      @submit="onSubmit"
    >
      <div class="grid gap-6 md:grid-cols-2">
        <div class="flex flex-col gap-6">
          <UFormField name="name" label="Project name" required>
            <UInput v-model="state.name" class="w-full" />
          </UFormField>
          <UFormField name="description" label="Description">
            <UTextarea v-model="state.description" class="w-full" autoresize />
          </UFormField>
        </div>

        <div class="flex flex-col items-center  gap-4">
          <UFormField name="logo" label="Project Logo" class="w-full">
            <UInput v-model="state.logo" class="w-full" />
          </UFormField>
          <UAvatar :src="state.logo" size="3xl" :alt="state.name" />
        </div>
      </div>

      <USeparator />

      <div class="flex flex-col gap-6">
        <div>
          <h3 class="font-semibold">
            Quick Links
          </h3>
          <p class="text-pretty text-xs text-muted">
            Add quick links to your project repository, homepage, etc...
          </p>
        </div>
        <div class="grid gap-6 md:grid-cols-2">
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
      </div>

      <div class="flex items-center justify-between pt-6">
        <UButton variant="ghost" @click="importProject">
          Import project from JSON
        </UButton>
        <div class="flex gap-4">
          <UButton variant="ghost" @click="reset">
            Reset
          </UButton>
          <UButton
            type="submit"
            loading-auto
            trailing
            form="createForm"
            label="Create Project"
          />
        </div>
      </div>
    </UForm>
    <template #actions>
      <ProjectRepoSelector v-model:full-repo="repoToImport">
        <CustomButton
          label="Import from GitHub"
          icon="i-simple-icons-github"
          variant="ghost"
          size="sm"
        />
      </ProjectRepoSelector>
    </template>
  </PageSection>
</template> 
