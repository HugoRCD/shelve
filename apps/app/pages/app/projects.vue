<script setup lang="ts">
import { isMounted } from '~/composables/useDOM'

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
    </div>
    <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <USkeleton v-for="i in 4" :key="i" class="h-32" />
    </div>
  </div>
</template>
