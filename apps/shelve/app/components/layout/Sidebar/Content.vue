<script setup lang="ts">
import { Role } from '@types'

const route = useRoute()
const teamSlug = computed(() => route.params.teamSlug as string)
const { user } = useUserSession()

const defaultTeamSlug = useCookie<string>('defaultTeamSlug', {
  watch: true,
})

const { version } = useRuntimeConfig().public

const teamNavigations = computed(() => getNavigation('team', teamSlug.value || defaultTeamSlug.value))
const userNavigations = getNavigation('user')
const adminNavigations = getNavigation('admin')

const handleProjectNavigation = () => {
  const isProjectRoute = route.path.includes('/projects/')
  const projectNavigation = {
    title: 'Project Details',
    icon: 'lucide:folder-open',
    path: route.path,
    name: 'Project Details',
  }
  if (isProjectRoute) {
    const indexToReplace = teamNavigations.value.findIndex((item) => item.path.includes('/projects/'))
    if (indexToReplace !== -1) {
      teamNavigations.value.splice(indexToReplace, 1, projectNavigation)
    } else {
      teamNavigations.value.unshift(projectNavigation)
    }
  } else {
    const indexToRemove = teamNavigations.value.findIndex((item) => item.path.includes('/projects/'))
    if (indexToRemove !== -1) {
      teamNavigations.value.splice(indexToRemove, 1)
    }
  }
}

watch(() => route.path, handleProjectNavigation, { immediate: true })
</script>

<template>
  <div class="flex h-full flex-col gap-4 p-4 sm:w-[250px]">
    <div class="flex justify-between items-center mb-4">
      <Logo size="size-6" />
      <UserDropdown />
    </div>

    <TeamManager />

    <!-- Team -->
    <div class="flex flex-col gap-2">
      <div class="text-xs font-medium text-(--ui-text-muted)">
        Team
      </div>
      <div class="flex flex-col gap-2">
        <TransitionGroup name="bezier" tag="ul" class="flex flex-col gap-2" mode="out-in">
          <LayoutNavItem v-for="nav in teamNavigations" :key="nav.name" :active="nav.path === route.path || nav.name === route.name" :nav-item="nav" />
        </TransitionGroup>
      </div>
    </div>

    <div v-if="user" class="flex flex-col gap-2">
      <USeparator class="my-3" />
      <div class="text-xs font-medium text-(--ui-text-muted)">
        User
      </div>
      <LayoutNavItem v-for="nav in userNavigations" :key="nav.name" :active="nav.path === route.path || nav.name === route.name" :nav-item="nav" />
    </div>

    <!-- Admin -->
    <div v-if="user && user.role === Role.ADMIN" class="flex flex-col gap-2">
      <USeparator class="my-3" />
      <div class="text-xs font-medium text-(--ui-text-muted)">
        Admin
      </div>
      <LayoutNavItem v-for="nav in adminNavigations" :key="nav.name" :active="nav.path === route.path" :nav-item="nav" />
    </div>

    <div class="flex-1" />
    <div class="flex flex-row justify-between items-center">
      <span class="text-xs font-mono">v{{ version }}</span>
      <div class="flex flex-row">
        <UTooltip text="Change theme" :content="{ side: 'top' }">
          <SettingThemeToggle size="size-5" />
        </UTooltip>
        <UTooltip text="Need help?" :content="{ side: 'top' }">
          <UButton variant="ghost" icon="lucide:life-buoy" to="https://github.com/HugoRCD/shelve/issues" />
        </UTooltip>
      </div>
    </div>
  </div>
</template>
