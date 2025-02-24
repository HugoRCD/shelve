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

const handleProjectNavigation = () => {
  const isProjectRoute = route.path.includes('/projects/')
  const projectNavigation = {
    title: 'Project Details',
    icon: 'lucide:folder-open',
    to: route.path,
    name: 'Project Details',
  }
  if (isProjectRoute) {
    const indexToReplace = teamNavigations.value.findIndex((item) => item.to.includes('/projects/'))
    if (indexToReplace !== -1) {
      teamNavigations.value.splice(indexToReplace, 1, projectNavigation)
    } else {
      teamNavigations.value.unshift(projectNavigation)
    }
  } else {
    const indexToRemove = teamNavigations.value.findIndex((item) => item.to.includes('/projects/'))
    if (indexToRemove !== -1) {
      teamNavigations.value.splice(indexToRemove, 1)
    }
  }
}

watch(() => route.path, handleProjectNavigation, { immediate: true })
</script>

<template>
  <div class="navbar-wrapper">
    <div class="highlight-wrapper highlight-gradient rounded-full">
      <div class="navbar z-10">
        <LayoutNavbarItem
          v-for="(nav, index) in teamNavigations"
          :key="index"
          :nav
        />
        <LayoutNavbarItem
          v-for="(nav, index) in userNavigations"
          :key="index"
          :nav
        />
        <template v-if="user && user.role === Role.ADMIN">
          <LayoutNavbarItem
            v-for="(nav, index) in adminNavigations"
            :key="index"
            class="hidden sm:flex"
            :nav
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "tailwindcss";

.navbar-wrapper {
  @apply absolute z-[99] bottom-2 sm:bottom-8 transform left-1/2 -translate-x-1/2 transition-all duration-200;
}

.navbar {
  @apply bg-(--ui-bg-elevated) backdrop-blur-lg shadow-2xl flex items-center gap-1 sm:gap-2 rounded-full border border-(--ui-border) p-2;
}
</style>

