<script setup lang="ts">
const route = useRoute()
const teamSlug = computed(() => route.params.teamSlug as string)

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
    <div class="navbar">
      <LayoutNavbarItem v-for="(nav, index) in teamNavigations" :key="index" :nav />
      <LayoutNavbarItem v-for="(nav, index) in userNavigations" :key="index" :nav />
      <LayoutNavbarItem v-for="(nav, index) in adminNavigations" :key="index" :nav />
    </div>
  </div>
</template>

<style scoped>
@import "tailwindcss";

.navbar-wrapper {
  @apply absolute z-[99] bottom-5 transform left-1/2 -translate-x-1/2;
}

.navbar {
  @apply bg-(--ui-bg) flex items-center gap-2 rounded-full border border-(--ui-border) p-2;
}
</style>

