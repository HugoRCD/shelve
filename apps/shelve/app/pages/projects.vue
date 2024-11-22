<script setup lang="ts">
definePageMeta({
  middleware: 'protected',
  path: '/',
})

const projects = useUserProjects()

const { loading, fetchProjects } = useProjects()

await fetchProjects()
</script>

<template>
  <div>
    <div class="flex items-center justify-end">
      <Teleport defer to="#action-items">
        <ProjectCreate />
      </Teleport>
    </div>
    <div v-if="!loading">
      <div v-if="projects.length === 0" class="flex h-64 flex-col items-center justify-center gap-4">
        <UIcon name="heroicons:folder-open" class="size-10 text-neutral-400" />
        <h2 class="text-lg font-semibold">
          No projects found
        </h2>
        <p class="text-sm text-neutral-500">
          You don't have any projects yet. Create one now!
        </p>
        <ProjectCreate />
      </div>
      <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <NuxtLink
          v-for="project in projects"
          :key="project.id"
          :to="`/project/${project.id}`"
        >
          <UCard class="h-full">
            <div class="flex w-full items-start gap-4">
              <UAvatar
                :src="project.logo"
                :alt="project.name"
                size="sm"
                img-class="object-cover"
              />
              <div class="flex flex-col gap-1">
                <h3 class="flex flex-col text-lg font-semibold">
                  {{ project.name }}
                </h3>
                <div class="text-xs font-normal text-neutral-500">
                  {{ project.description }}
                </div>
              </div>
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </div>
    <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <USkeleton v-for="i in 4" :key="i" class="h-32" />
    </div>
  </div>
</template>
