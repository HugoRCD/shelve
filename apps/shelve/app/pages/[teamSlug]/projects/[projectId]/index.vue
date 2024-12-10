<script setup lang="ts">
definePageMeta({
  middleware: (to, from) => {
    const projectId = to.params.projectId || from.params.projectId || ''
    const teamSlug = to.params.teamSlug || from.params.teamSlug || ''
    if (to.path === `/${teamSlug}/projects/${projectId}`) {
      return `/${teamSlug}/projects/${projectId}/variables`
    }
  }
})

const route = useRoute()
const projectId = route.params.projectId as string
const teamSlug = route.params.teamSlug as string

const project = useProject(+projectId)

if (!project.value)
  useProjectsService().fetchCurrentProject(+projectId)

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
    <ProjectMainSection />
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
