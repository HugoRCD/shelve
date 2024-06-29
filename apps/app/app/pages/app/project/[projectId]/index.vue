<script setup lang="ts">
definePageMeta({
  middleware: 'project-redirect'
})

const { projectId } = useRoute().params as { projectId: string }

const {
  currentProject,
  currentLoading,
  fetchCurrentProject
} = useProjects()

if (!currentProject.value)
  fetchCurrentProject(+projectId)

async function refresh() {
  await fetchCurrentProject(+projectId)
}

provide('project', currentProject)
provide('loading', currentLoading)
provide('refresh', refresh)

const links = [
  {
    label: 'Environment Variables',
    icon: 'i-lucide-container',
    to: `/app/project/${projectId}/variables`
  },
  {
    label: 'Files',
    icon: 'i-lucide-files',
    to: `/app/project/${projectId}/files`
  },
  {
    label: 'Keys',
    icon: 'i-heroicons-key',
    to: `/app/project/${projectId}/keys`
  },
  {
    label: 'Settings',
    icon: 'i-heroicons-cog',
    to: `/app/project/${projectId}/settings`
  },
]
</script>

<template>
  <div class="flex flex-col">
    <ProjectMainSection :project="currentProject" :loading="currentLoading" />
    <UHorizontalNavigation :links class="mt-8 hidden border-b border-gray-200 dark:border-gray-800 md:block" />
    <UVerticalNavigation :links class="mt-8 border-b border-gray-200 pb-2 dark:border-gray-800 md:hidden" />
    <NuxtPage />
  </div>
</template>

<style scoped>

</style>
