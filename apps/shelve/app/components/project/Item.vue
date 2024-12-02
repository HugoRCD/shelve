<script setup lang="ts">
import type { Project } from '@shelve/types'

const { teamSlug } = useRoute().params

defineProps<{
  project: Project
}>()

const active = useState('active-project')
</script>

<template>
  <NuxtLink :to="`/${teamSlug}/projects/${project.id}`">
    <UCard class="h-full" @click="active = project.id">
      <div class="flex w-full items-start gap-4">
        <UAvatar
          :src="project.logo"
          :alt="project.name"
          size="sm"
          img-class="object-cover"
          class="logo"
          :class="{ active: active === project.id }"
        />
        <div class="flex flex-col gap-1">
          <h3 class="flex flex-col text-lg font-semibold" :class="{ active: active === project.id }">
            {{ project.name }}
          </h3>
          <div class="text-xs font-normal text-neutral-500" :class="{ active: active === project.id }">
            {{ project.description }}
          </div>
        </div>
      </div>
    </UCard>
  </NuxtLink>
</template>

<style scoped>
.logo.active {
  view-transition-name: project-logo;
}

h3.active {
  view-transition-name: project-name;
}

div.active {
  view-transition-name: project-description;
}
</style>
