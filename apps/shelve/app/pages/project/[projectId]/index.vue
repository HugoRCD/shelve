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

const items = [
  {
    label: 'Environment Variables',
    icon: 'lucide:container',
    to: `/project/${projectId}/variables`
  },
  {
    label: 'Files',
    icon: 'lucide:files',
    to: `/project/${projectId}/files`
  },
  {
    label: 'Settings',
    icon: 'heroicons:cog',
    to: `/project/${projectId}/settings`
  },
]
</script>

<template>
  <div class="flex flex-col">
    <ProjectMainSection :project="currentProject" :loading="currentLoading" />
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
