<script setup lang="ts">
import type { Project } from '@types'

const route = useRoute()
const teamSlug = route.params.teamSlug as string

defineProps<{
  project: Project
}>()

const active = useState('active-project')
</script>

<template>
  <UCard variant="subtle" class="relative transition-all duration-300 group hover:z-10 h-full ring-transparent border border-default bg-transparent hover:bg-muted rounded-none" @click="active = project.id">
    <NuxtLink class="absolute inset-0 z-10" :to="`/${teamSlug}/projects/${project.id}/variables`" />
    <Motion as="span" class="dot dot-flicker dot-tl" />
    <Motion as="span" class="dot dot-flicker dot-br" />
    <Motion as="span" class="dot dot-flicker dot-tr" />
    <Motion as="span" class="dot dot-flicker dot-bl" />
    <div class="flex w-full items-start gap-4">
      <!-- <UAvatar 
          :src="project.logo"
          :alt="project.name"
          size="sm"
          img-class="object-cover"
          class="logo"
          :class="{ active: active === project.id }"
        /> -->
      <div class="flex flex-col gap-1">
        <h3 class="flex flex-col text-lg text-highlighted font-semibold" :class="{ active: active === project.id }">
          {{ project.name }}
        </h3>
        <div class="text-xs font-normal text-muted" :class="{ active: active === project.id }">
          {{ project.description }}
        </div>
      </div>
    </div>
  </UCard>
</template>

<style scoped>
@reference '../../assets/css/index.css';

.dot {
  @apply opacity-0 group-hover:opacity-100;
}

.group:hover .dot-flicker {
  animation: dot-flicker 0.200s ease-in-out forwards;
}

.dot-tl {
  @apply before:absolute;
  @apply before:top-[-2px] before:left-[-2px] before:bg-inverted before:content-[''] before:w-[3px] before:h-[3px];
}

.dot-br {
  @apply before:absolute;
  @apply before:bottom-[-2px] before:right-[-2px] before:bg-inverted before:content-[''] before:w-[3px] before:h-[3px];
}

.dot-tr {
  @apply before:absolute;
  @apply before:top-[-2px] before:right-[-2px] before:bg-inverted before:content-[''] before:w-[3px] before:h-[3px];
}

.dot-bl {
  @apply before:absolute;
  @apply before:bottom-[-2px] before:left-[-2px] before:bg-inverted before:content-[''] before:w-[3px] before:h-[3px];
}

@keyframes dot-flicker {
  0% { opacity: 0; }
  20% { opacity: 1; }
  40% { opacity: 0; }
  60% { opacity: 1; }
  80% { opacity: 0; }
  100% { opacity: 1; }
}

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
