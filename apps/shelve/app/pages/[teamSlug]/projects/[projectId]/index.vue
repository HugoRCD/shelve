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

const project = useProject(projectId)

if (!project.value)
  useProjectsService().fetchCurrentProject(+projectId)

const items = [
  {
    label: 'Environment Variables',
    icon: 'lucide:container',
    to: `/${teamSlug}/projects/${projectId}/variables`
  }, {
    label: 'Settings',
    icon: 'heroicons:cog',
    to: `/${teamSlug}/projects/${projectId}/settings`
  },
]

useSeoMeta({
  title: () => project.value?.name,
  titleTemplate: () => `%s project - Shelve`
})
</script>

<template>
  <div class="flex flex-col">
    <ProjectMainSection />
    <div class="mt-4">
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
