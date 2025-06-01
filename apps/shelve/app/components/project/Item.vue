<script setup lang="ts">
import type { Project } from '@types'

const route = useRoute()
const teamSlug = route.params.teamSlug as string

defineProps<{
  project: Project
}>()

const active = useState('active-project')
const isHovered = ref(false)

const containerVariants = {
  hidden: { 
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
      when: 'afterChildren'
    }
  },
  visible: { 
    transition: {
      staggerChildren: 0.05,
      when: 'beforeChildren'
    }
  }
}

const dotVariants = {
  hidden: { 
    opacity: 0 
  },
  visible: { 
    opacity: [0, 1, 0, 1, 0, 1],
    transition: {
      duration: 0.2,
      ease: 'easeInOut'
    }
  }
}
</script>

<template>
  <UCard 
    variant="subtle" 
    class="relative transition-all duration-300 group hover:z-10 h-full ring-transparent border border-default bg-transparent hover:bg-muted rounded-none" 
    @click="active = project.id"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <NuxtLink class="absolute inset-0 z-10" :to="`/${teamSlug}/projects/${project.id}/variables`" />
    
    <MotionConfig :transition="{ duration: 0.2, ease: 'easeInOut' }">
      <Motion
        :variants="containerVariants"
        :animate="isHovered ? 'visible' : 'hidden'"
        class="absolute inset-0 pointer-events-none"
      >
        <Motion as="span" class="dot dot-tl" :variants="dotVariants" />
        <Motion as="span" class="dot dot-br" :variants="dotVariants" />
        <Motion as="span" class="dot dot-tr" :variants="dotVariants" />
        <Motion as="span" class="dot dot-bl" :variants="dotVariants" />
      </Motion>
    </MotionConfig>
    
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
