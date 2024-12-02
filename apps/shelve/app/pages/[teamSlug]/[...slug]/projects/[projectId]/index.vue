<script setup lang="ts">
definePageMeta({
  middleware: 'project-redirect'
})

const { projectId, teamSlug } = useRoute().params as { projectId: string, teamSlug: string }
const currentProject = useProject()

const {
  currentLoading,
  fetchCurrentProject
} = useProjectsService()

if (!currentProject.value)
  await fetchCurrentProject(+projectId)

async function refresh() {
  await fetchCurrentProject(+projectId)
}

provide('loading', currentLoading)
provide('refresh', refresh)

const items = [
  {
    label: 'Environment Variables',
    icon: 'lucide:container',
    to: `/${teamSlug}/projects/${projectId}/variables`
  },
  {
    label: 'Files',
    icon: 'lucide:files',
    to: `/${teamSlug}/projects/${projectId}/files`
  },
  {
    label: 'Settings',
    icon: 'heroicons:cog',
    to: `/${teamSlug}/projects/${projectId}/settings`
  },
]
</script>

<template>
  <div class="flex flex-col">
    <ProjectMainSection v-model="currentProject" :loading="currentLoading" />
    <div class="mt-8 mb-4 border-b border-neutral-200 dark:border-neutral-800">
      <UNavigationMenu
        color="neutral"
        orientation="horizontal"
        :items
        class="hidden md:block"
      />
      <UNavigationMenu
        highlight
        variant="link"
        color="neutral"
        orientation="vertical"
        :items
        class="md:hidden"
      />
    </div>
    <NuxtPage />
  </div>
</template>
