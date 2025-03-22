<script setup lang="ts">
const route = useRoute()
const teamSlug = computed(() => route.params.teamSlug as string)
const projects = useProjects(teamSlug.value)

const { loading, fetchProjects } = useProjectsService()

if (!projects.value)
  await fetchProjects()
</script>

<template>
  <div>
    <Teleport defer to="#action-items">
      <ProjectCreate />
    </Teleport>
    <div v-if="!loading">
      <div v-if="projects.length === 0" class="flex h-64 flex-col items-center justify-center gap-4">
        <UIcon name="heroicons:folder-open" class="size-10 text-(--ui-text-muted)" />
        <h2 class="text-lg font-semibold">
          No projects found
        </h2>
        <p class="text-sm text-(--ui-text-muted)">
          You don't have any projects yet. Create one now!
        </p>
        <ProjectCreate />
      </div>
      <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProjectItem v-for="project in projects" :key="project.id" :project />
      </div>
    </div>
    <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <USkeleton v-for="i in 4" :key="i" class="h-32" />
    </div>
  </div>
</template>

