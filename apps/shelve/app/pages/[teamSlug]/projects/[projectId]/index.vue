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
const router = useRouter()
const projectId = route.params.projectId as string
const teamSlug = route.params.teamSlug as string

const project = useProject(projectId)

if (!project.value)
  useProjectsService().fetchCurrentProject(+projectId)

const items = [
  {
    label: 'Environment Variables',
    icon: 'lucide:container',
    value: 'variables'
  },
  {
    label: 'Settings', 
    icon: 'heroicons:cog',
    value: 'settings'
  },
]

const activeTab = computed({
  get() {
    return route.path.split('/').pop() || 'variables'
  },
  set(tab) {
    router.push({
      path: `/${teamSlug}/projects/${projectId}/${tab}`
    })
  }
})

useSeoMeta({
  title: () => project.value?.name,
  titleTemplate: () => `%s project - Shelve`
})
</script>

<template>
  <div class="flex flex-col">
    <ProjectMainSection />
    <UTabs v-model="activeTab" :items variant="link" class="w-full mt-4 mb-2" />
    <NuxtPage />
  </div>
</template>
