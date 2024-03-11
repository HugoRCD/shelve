<script setup lang="ts">
const route = useRoute()
const projectId = route.params.projectId
navigateTo(`/app/project/${projectId}/variables`)

const {data: project, status} = useFetch(`/api/project/${projectId}`, {
  method: "GET",
  watch: false,
})

const links = [
  {
    label: 'Environment Variables',
    icon: 'i-heroicons-variable',
    to: `/app/project/${projectId}/variables`
  },
  {
    label: 'Assets',
    icon: 'i-lucide-images',
    to: `/app/project/${projectId}/assets`
  },
  {
    label: 'Files',
    icon: 'i-lucide-files',
    to: `/app/project/${projectId}/files`
  },
  {
    label: 'Users',
    icon: 'i-heroicons-user-group',
    to: `/app/project/${projectId}/users`
  },
  {
    label: 'Keys',
    icon: 'i-heroicons-key',
    to: `/app/project/${projectId}/keys`
  }
]
</script>

<template>
  <div class="flex flex-col">
    <ProjectMainSection :project="project" :loading="status === 'pending'" />
    <UHorizontalNavigation :links="links" class="mt-8 hidden border-b border-gray-200 dark:border-gray-800 md:block" />
    <UVerticalNavigation :links="links" class="mt-8 border-b border-gray-200 pb-2 dark:border-gray-800 md:hidden" />
    <NuxtPage />
  </div>
</template>

<style scoped>

</style>
