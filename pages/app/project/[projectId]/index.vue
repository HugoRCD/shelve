<script setup lang="ts">
const route = useRoute()
const projectId = route.params.projectId

const {data: project, status} = useFetch(`/api/project/${projectId}`, {
  method: "GET",
  watch: false,
})

const tabs = [
  {
    slot: "variables",
    label: "Environment Variables",
  },
  {
    slot: "Users",
    label: "Users",
  },
];

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
  }
]
</script>

<template>
  <div class="flex flex-col">
    <ProjectMainSection :project="project" :loading="status === 'pending'" />
    <UHorizontalNavigation :links="links" class="mt-8 border-b border-gray-200 dark:border-gray-800" />
    <NuxtPage />
    <!--    <UTabs :items="tabs">
      <template #variables>
        <ProjectVariables v-if="project" :project-id />
      </template>
    </UTabs>-->
  </div>
</template>

<style scoped>

</style>
