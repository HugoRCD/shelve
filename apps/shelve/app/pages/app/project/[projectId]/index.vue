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
  await fetchCurrentProject(+projectId)


async function refresh() {
  await fetchCurrentProject(+projectId)
}

provide('project', currentProject)
provide('loading', currentLoading)
provide('refresh', refresh)

const links = [
  {
    label: 'Environment Variables',
    icon: 'lucide:container',
    to: `/app/project/${projectId}/variables`
  },
  {
    label: 'Files',
    icon: 'lucide:files',
    to: `/app/project/${projectId}/files`
  },
  {
    label: 'Keys',
    icon: 'heroicons:key',
    to: `/app/project/${projectId}/keys`
  },
  {
    label: 'Settings',
    icon: 'heroicons:cog',
    to: `/app/project/${projectId}/settings`
  },
]
</script>

<template>
  <div class="flex flex-col">
    <ProjectMainSection :project="currentProject" :loading="currentLoading" />
    <UNavigationMenu orientation="horizontal" :items="links" class="mt-8 hidden border-b border-neutral-200 dark:border-neutral-800 md:block" />
    <UNavigationMenu orientation="vertical" :items="links" class="mt-8 border-b border-neutral-200 pb-2 dark:border-neutral-800 md:hidden" />
    <NuxtPage />
  </div>
</template>
