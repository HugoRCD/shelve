<script setup lang="ts">
import { Role } from '@types'

const route = useRoute()
const teamSlug = computed(() => route.params.teamSlug as string)
const { user } = useUserSession()

const defaultTeamSlug = useCookie<string>('defaultTeamSlug', {
  watch: true,
})

const teamNavigations = computed(() => getNavigation('team', teamSlug.value || defaultTeamSlug.value))
const userNavigations = getNavigation('user')
const adminNavigations = getNavigation('admin')

const baseTeamNavigations = computed(() => getNavigation('team', teamSlug.value || defaultTeamSlug.value))
const teamNavigationsRef = ref(baseTeamNavigations.value)

watch(baseTeamNavigations, (newValue) => {
  teamNavigationsRef.value = [...newValue]
})

const handleProjectNavigation = () => {
  const isProjectRoute = route.path.includes('/projects/')
  const projectNavigation = {
    title: 'Project Details',
    icon: 'lucide:folder-open',
    to: route.path,
    name: 'Project Details',
  }

  if (isProjectRoute) {
    const indexToReplace = teamNavigationsRef.value.findIndex((item) => item.to.includes('/projects/'))
    if (indexToReplace !== -1) {
      teamNavigationsRef.value.splice(indexToReplace, 1, projectNavigation)
    } else {
      teamNavigationsRef.value = [projectNavigation, ...teamNavigationsRef.value]
    }
  } else {
    const indexToRemove = teamNavigationsRef.value.findIndex((item) => item.to.includes('/projects/'))
    if (indexToRemove !== -1) {
      teamNavigationsRef.value = teamNavigationsRef.value.filter((_, index) => index !== indexToRemove)
    }
  }
}

watch(() => route.path, handleProjectNavigation, { immediate: true })
</script>

<template>
  <div class="navbar-wrapper">
    <div class="navbar">
      <TransitionGroup
        tag="div"
        class="flex items-center gap-2"
        name="fade-scale"
        mode="out-in"
      >
        <LayoutNavbarItem
          v-for="nav in teamNavigationsRef"
          :key="nav.to"
          :nav
        />
        <LayoutNavbarItem
          v-for="nav in userNavigations"
          :key="nav.to"
          :nav
        />
        <template v-if="user && user.role === Role.ADMIN">
          <LayoutNavbarItem
            v-for="nav in adminNavigations"
            :key="nav.to"
            :nav
          />
        </template>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
@import "tailwindcss";


.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.fade-scale-enter-to,
.fade-scale-leave-from {
  opacity: 1;
  transform: scale(1);
}

.fade-scale-move {
  transition: transform 0.25s ease;
}

.navbar-wrapper {
  @apply absolute z-[99] bottom-2 sm:bottom-8 left-1/2 -translate-x-1/2 transition-all duration-200;
}

.navbar {
  @apply bg-(--ui-bg-elevated) backdrop-blur-lg shadow-2xl flex items-center gap-1 sm:gap-2 rounded-full border border-(--ui-border) p-2;
}
</style>
