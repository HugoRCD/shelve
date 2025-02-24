<script setup lang="ts">
import { Role } from '@types'

const route = useRoute()
const teamSlug = computed(() => route.params.teamSlug as string)
const { user } = useUserSession()

const defaultTeamSlug = useCookie<string>('defaultTeamSlug', {
  watch: true,
})

const allNavigations = computed(() => {
  const team = getNavigation('team', teamSlug.value || defaultTeamSlug.value)
  const userNav = getNavigation('user')
  const admin = user.value?.role === Role.ADMIN ? getNavigation('admin') : []

  return [...team, ...userNav, ...admin]
})

const navigationItems = ref(allNavigations.value)

watch(allNavigations, (newValue) => {
  navigationItems.value = [...newValue]
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
    const indexToReplace = navigationItems.value.findIndex((item) => item.to.includes('/projects/'))
    if (indexToReplace !== -1) {
      navigationItems.value.splice(indexToReplace, 1, projectNavigation)
    } else {
      navigationItems.value = [projectNavigation, ...navigationItems.value]
    }
  } else {
    navigationItems.value = navigationItems.value.filter(item => !item.to.includes('/projects/'))
  }
}

watch(() => route.path, handleProjectNavigation, { immediate: true })
</script>

<template>
  <div class="navbar-wrapper">
    <div class="highlight-wrapper highlight-gradient rounded-full">
      <div class="navbar">
        <TransitionGroup tag="div" class="flex items-center gap-2" name="bezier" mode="out-in">
          <div v-for="nav in navigationItems" :key="nav.to">
            <ULink v-bind="nav" exact>
              <UTooltip :text="nav.name" :content="{ side: 'top' }">
                <div class="highlight-wrapper rounded-full" :data-active="nav.to === route.path">
                  <div class="nav-item" :data-active="nav.to === route.path">
                    <UIcon :name="nav.icon" class="icon" />
                  </div>
                </div>
              </UTooltip>
            </ULink>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "tailwindcss";

.navbar-wrapper {
  @apply absolute z-[99] bottom-2 sm:bottom-8 left-1/2 -translate-x-1/2 transition-all duration-200;
}

.navbar {
  @apply bg-(--ui-bg-elevated) backdrop-blur-lg shadow-2xl flex items-center gap-1 sm:gap-2 rounded-full border border-(--ui-border) p-2;
}

.nav-item {
  /* Structural */
  @apply rounded-full p-2 flex items-center justify-center;

  /* Active */
  @apply data-[active=true]:bg-(--ui-bg-accented) data-[active=true]:shadow-md bg-transparent;

  /* Hover */
  @apply hover:bg-(--ui-bg-accented) hover:shadow-md;

  .icon {
    @apply sm:text-lg text-(--ui-text-highlighted);
  }
}
</style>
