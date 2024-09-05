<script setup lang="ts">
const {
  projects,
  loading,
  fetchProjects,
} = useProjects()

if (!projects.value)
  fetchProjects()
</script>

<template>
  <div>
    <div class="flex items-center justify-end">
      <Teleport v-if="isMounted('action-items')" to="#action-items">
        <ProjectCreate />
      </Teleport>
    </div>
    <div v-if="!loading" class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <NuxtLink
        v-for="project in projects"
        :key="project.id"
        :to="`/app/project/${project.id}`"
      >
        <UCard class="h-full">
          <div class="flex w-full items-start gap-4">
            <UAvatar
              :src="project.avatar"
              :alt="project.name"
              size="sm"
              img-class="object-cover"
            />
            <div class="flex flex-col gap-1">
              <h3 class="flex flex-col text-lg font-semibold">
                {{ project.name }}
              </h3>
              <div class="text-xs font-normal text-gray-500">
                {{ project.description }}
              </div>
            </div>
          </div>
        </UCard>
      </NuxtLink>
      <div v-if="projects.length === 0" class="flex h-64 flex-col items-center justify-center gap-4">
        <UIcon name="heroicons:folder-open" class="size-10 text-gray-400" />
        <h2 class="text-lg font-semibold">
          No projects found
        </h2>
        <p class="text-sm text-gray-500">
          You don't have any projects yet. Create one now!
        </p>
        <ProjectCreate />
      </div>
    </div>
    <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <USkeleton v-for="i in 4" :key="i" class="h-32" />
    </div>
  </div>
</template>
